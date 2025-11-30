import React, { useEffect, useState, useRef } from "react";
import { api } from "../services/api.js";
import { getImageUrl } from "../constants.js";
import {
  ImageVideoIcon,
  ThumbsUpIcon,
  MessageSquareIcon,
  SendIcon,
  MoreHorizontalIcon,
} from "./Icons.jsx";

const Feed = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await api.getPosts();
    setPosts(data);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent && !selectedFile) return;

    const formData = new FormData();
    formData.append("content", newPostContent);
    if (selectedFile) {
      formData.append("media", selectedFile);
    }

    if (editingPost) {
      await api.updatePost(editingPost.id, formData);
      setEditingPost(null);
    } else {
      await api.createPost(formData);
    }
    setNewPostContent("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    loadPosts();
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPostContent(post.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setNewPostContent("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    await api.deletePost(postId);
    loadPosts();
  };

  const handleLike = async (post) => {
    await api.likePost(post.id);
    loadPosts();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
      {/* Left Sidebar - Profile */}
      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="h-16 bg-gray-600 relative">
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-16 rounded-full bg-white p-1">
                <img
                  src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=random`}
                  alt="Profile"
                  className="w-full h-full rounded-full"
                />
              </div>
            </div>
          </div>
          <div className="mt-10 px-4 pb-4 text-center border-b border-gray-200">
            <h3 className="font-bold text-lg">{currentUser.username}</h3>
            <p className="text-gray-500 text-xs">Web Developer</p>
          </div>
          <div className="p-3 text-xs text-gray-500 font-bold border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex justify-between">
            <span>Connections</span>
            <span className="text-primary">0</span>
          </div>
        </div>
      </div>

      {/* Center - Feed */}
      <div className="col-span-1 md:col-span-2 space-y-4">
        {/* Create/Edit Post */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          {editingPost && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded flex justify-between items-center">
              <span className="text-sm text-blue-700 font-semibold">
                Editing post
              </span>
              <button
                onClick={handleCancelEdit}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-3 mb-3">
            <img
              src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=random`}
              alt="Me"
              className="w-12 h-12 rounded-full"
            />
            <button className="flex-grow text-left px-4 py-3 rounded-full border border-gray-400 font-semibold text-gray-500 hover:bg-gray-100 transition">
              {editingPost ? "Update your post" : "Start a post"}
            </button>
          </div>
          <div className="flex justify-between items-center pt-2">
            <form
              onSubmit={handlePostSubmit}
              className="flex-1 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Write something..."
                className="flex-grow p-2 outline-none text-sm"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center text-blue-500 hover:bg-blue-50 px-2 py-1 rounded"
              >
                <ImageVideoIcon className="w-5 h-5 mr-1" />
                <span className="text-sm font-semibold">Media</span>
              </button>
              {selectedFile && (
                <span className="text-xs text-gray-500 truncate max-w-[100px]">
                  {selectedFile.name}
                </span>
              )}

              {(newPostContent || selectedFile) && (
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-blue-700"
                >
                  {editingPost ? "Update" : "Post"}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <hr className="flex-grow border-gray-300 mr-2" />
          <span>
            Sort by: <strong>Newest</strong>
          </span>
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onLike={() => handleLike(post)}
            onEdit={() => handleEditPost(post)}
            onDelete={() => handleDeletePost(post.id)}
          />
        ))}
      </div>

      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-2">
          <h4 className="font-bold text-sm mb-4">Add to your feed</h4>
          {["Elon Musk", "Bill Gates", "React Community"].map((name, i) => (
            <div key={i} className="flex gap-3 mb-3 items-start">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div>
                <p className="font-bold text-sm">{name}</p>
                <p className="text-xs text-gray-500">Public Figure</p>
                <button className="mt-1 px-3 py-1 border border-gray-500 rounded-full text-gray-600 font-bold text-xs hover:bg-gray-100 flex items-center">
                  <span className="mr-1">+</span> Follow
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <h4 className="font-bold text-sm mb-2">Promoted</h4>
          <div className="bg-gray-100 p-2 rounded text-xs text-gray-500 text-center">
            Ad Content Placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

const PostCard = ({ post, currentUser, onLike, onEdit, onDelete }) => {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleComments = async () => {
    if (!showComments) {
      const data = await api.getComments(post.id);
      setComments(data);
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment) return;
    await api.createComment({ post_id: post.id, content: newComment });
    const data = await api.getComments(post.id);
    setComments(data);
    setNewComment("");
  };

  const isOwnPost = post.user_id === currentUser.id;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-3 flex items-start justify-between">
        <div className="flex gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${post.username}&background=random`}
            alt={post.username}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-bold text-sm text-gray-900">{post.username}</h3>
            <p className="text-xs text-gray-500">Member</p>
          </div>
        </div>

        {isOwnPost && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:bg-gray-100 p-1 rounded-full"
            >
              <MoreHorizontalIcon />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40 z-10">
                <button
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <span>✏️</span> Edit post
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                >
                  <span>🗑️</span> Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-3 pb-2 text-sm text-gray-900">{post.content}</div>
      {post.media && (
        <div className="w-full">
          <img
            src={getImageUrl(post.media)}
            alt="Post media"
            className="w-full object-cover max-h-96"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 flex justify-between">
        <span>{post.likes_count} likes</span>
        <button
          onClick={toggleComments}
          className="hover:underline hover:text-blue-500"
        >
          {showComments ? "Hide comments" : "comments"}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex justify-around">
        <button
          onClick={onLike}
          className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded text-gray-600 font-bold text-sm"
        >
          <ThumbsUpIcon className="w-5 h-5" /> Like
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded text-gray-600 font-bold text-sm"
        >
          <MessageSquareIcon className="w-5 h-5" /> Comment
        </button>
        <button className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded text-gray-600 font-bold text-sm">
          <SendIcon className="w-5 h-5" /> Share
        </button>
      </div>

      {showComments && (
        <div className="bg-gray-50 p-3 rounded-b-lg">
          <form onSubmit={submitComment} className="flex gap-2 mb-4">
            <img
              src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=random`}
              className="w-8 h-8 rounded-full"
              alt="Me"
            />
            <input
              type="text"
              className="flex-grow border border-gray-300 rounded-full px-3 py-1 text-sm outline-none focus:border-gray-500"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </form>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2 items-start">
                <img
                  src={`https://ui-avatars.com/api/?name=${comment.username}&background=random`}
                  className="w-8 h-8 rounded-full"
                  alt={comment.username}
                />
                <div className="bg-gray-200 rounded-r-lg rounded-bl-lg p-2 text-sm">
                  <p className="font-bold text-xs">{comment.username}</p>
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;

