const express = require("express");
const mysql = require("mysql2/promise");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),
);

app.use(
  session({
    secret: "your-secret-key-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

const PORT = 3000;

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });
app.use("/uploads", express.static(path.resolve(uploadDir)));

async function startServer() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "social_app",
  });

  console.log("Connected to MySQL");
  app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const [result] = await db.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password],
    );
    res.json({ message: "User registered", userId: result.insertId });
  });
  app.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    const [rows] = await db.query(
      "SELECT id, username FROM users WHERE username = ? AND password = ?",
      [username, password],
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    req.session.userId = rows[0].id;
    req.session.username = rows[0].username;

    res.json({
      message: "Signed in",
      user: { id: rows[0].id, username: rows[0].username },
    });
  });

  app.post("/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.post("/posts", upload.single("media"), async (req, res) => {
    const { content } = req.body;
    const media = req.file ? `/uploads/${req.file.filename}` : null;

    const userId = req.session.userId || req.body.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [result] = await db.query(
      "INSERT INTO posts (user_id, text, media) VALUES (?, ?, ?)",
      [userId, content, media],
    );
    res.json({ message: "Post created", postId: result.insertId });
  });

  app.get("/posts", async (req, res) => {
    const [posts] = await db.query(`
        SELECT 
          p.id,
          p.user_id,
          p.text as content,
          p.media,
          u.username,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likes_count
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.id DESC
      `);
    res.json(posts);
  });

  app.post("/posts/:id/like", async (req, res) => {
    const postId = req.params.id;
    const userId = req.session.userId || req.body.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [existing] = await db.query(
      "SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?",
      [postId, userId],
    );

    if (existing.length > 0) {
      // Unlike
      await db.query(
        "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?",
        [postId, userId],
      );
      res.json({ message: "Post unliked" });
    } else {
      // Like
      await db.query(
        "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)",
        [postId, userId],
      );
      res.json({ message: "Post liked" });
    }
  });

  app.put("/posts/:id", upload.single("media"), async (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.session.userId || req.body.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [post] = await db.query("SELECT user_id FROM posts WHERE id = ?", [
      postId,
    ]);

    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post[0].user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this post" });
    }

    let updateQuery = "UPDATE posts SET text = ?";
    let params = [content];
    if (req.file) {
      updateQuery += ", media = ?";
      params.push(`/uploads/${req.file.filename}`);
    }

    updateQuery += " WHERE id = ?";
    params.push(postId);

    await db.query(updateQuery, params);
    res.json({ message: "Post updated successfully" });
  });

  app.delete("/posts/:id", async (req, res) => {
    const postId = req.params.id;
    const userId = req.session.userId || req.body.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [post] = await db.query("SELECT user_id FROM posts WHERE id = ?", [
      postId,
    ]);

    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post[0].user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this post" });
    }

    // Delete related data first
    await db.query("DELETE FROM post_likes WHERE post_id = ?", [postId]);
    await db.query("DELETE FROM comments WHERE post_id = ?", [postId]);

    // Delete the post
    await db.query("DELETE FROM posts WHERE id = ?", [postId]);

    res.json({ message: "Post deleted successfully" });
  });

  app.get("/comments/:postId", async (req, res) => {
    const postId = req.params.postId;
    const [comments] = await db.query(
      `
        SELECT 
          c.id,
          c.post_id,
          c.user_id,
          c.text as content,
          u.username,
          (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) AS likes_count
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.id ASC
      `,
      [postId],
    );
    res.json(comments);
  });

  app.post("/comments", async (req, res) => {
    const { post_id, content } = req.body;
    const userId = req.session.userId || req.body.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [result] = await db.query(
      "INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)",
      [post_id, userId, content],
    );
    res.json({ message: "Comment added", commentId: result.insertId });
  });

  app.get("/users", async (req, res) => {
    const currentUserId = req.session.userId;

    if (!currentUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [users] = await db.query(
      `
        SELECT 
          u.id,
          u.username,
          (SELECT COUNT(*) FROM messages WHERE from_id = u.id OR to_id = u.id) as connections
        FROM users u
        WHERE u.id != ?
        ORDER BY u.username ASC
      `,
      [currentUserId],
    );
    res.json(users);
  });

  app.get("/messages/:userId", async (req, res) => {
    const otherUserId = req.params.userId;
    const currentUserId = req.session.userId || req.body.user_id;

    if (!currentUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [messages] = await db.query(
      `
        SELECT m.*, 
          sender.username as from_username,
          receiver.username as to_username
        FROM messages m
        LEFT JOIN users sender ON m.from_id = sender.id
        LEFT JOIN users receiver ON m.to_id = receiver.id
        WHERE (m.from_id = ? AND m.to_id = ?) 
           OR (m.from_id = ? AND m.to_id = ?)
        ORDER BY m.id ASC
      `,
      [currentUserId, otherUserId, otherUserId, currentUserId],
    );
    res.json(messages);
  });

  app.post("/messages", async (req, res) => {
    const { to_id, content } = req.body;
    const fromId = req.session.userId || req.body.from_id;

    if (!fromId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [result] = await db.query(
      "INSERT INTO messages (from_id, to_id, content) VALUES (?, ?, ?)",
      [fromId, to_id, content],
    );
    res.json({ message: "Message sent", messageId: result.insertId });
  });

  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`),
  );
}

startServer().catch((err) => console.error("Failed to start server:", err));
