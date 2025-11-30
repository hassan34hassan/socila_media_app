import React, { useState } from "react";
import { api } from "../services/api.js";

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (isLogin) {
      const res = await api.login({ username, password });
      onLogin(res.user);
    } else {
      await api.signup({ username, password });
      const res = await api.login({ username, password });
      onLogin(res.user);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      <h1 className="text-primary text-5xl font-bold mb-8">T</h1>
      <h2 className="text-3xl mb-8 text-center text-gray-700">
        Welcome to your
        <br /> traveler's community
      </h2>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 border border-gray-400 rounded text-gray-800 focus:border-primary focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-400 rounded text-gray-800 focus:border-primary focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-primary text-white p-3 rounded-full font-bold hover:bg-blue-700 transition"
        >
          {isLogin ? "Sign in" : "Join now"}
        </button>
      </form>

      <div className="mt-6">
        <span className="text-gray-600">
          {isLogin ? "New to Travelsdin? " : "Already have an account? "}
        </span>
        <button
          className="text-primary font-bold hover:underline"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
        >
          {isLogin ? "Join now" : "Sign in"}
        </button>
      </div>
    </div>
  );
};

export default Login;

