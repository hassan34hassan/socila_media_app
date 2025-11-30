import React, { useEffect, useState, useRef } from "react";
import { api } from "../services/api.js";
import { MoreHorizontalIcon, SearchIcon, SendIcon } from "./Icons.jsx";

const Messaging = ({ currentUser, initialChatId }) => {
  const [activeChatId, setActiveChatId] = useState(initialChatId);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await api.getUsers();
    setUsers(data);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeUser = users.find((u) => u.id === activeChatId);

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
      const interval = setInterval(() => loadMessages(activeChatId), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (userId) => {
    const data = await api.getMessages(userId);
    setMessages(data);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatId) return;

    try {
      await api.sendMessage({ to_id: activeChatId, content: newMessage });
      setNewMessage("");
      loadMessages(activeChatId);
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto pt-6 px-4 h-[calc(100vh-60px)]">
      <div className="bg-white rounded-t-lg shadow border border-gray-200 h-full flex overflow-hidden">
        {/* Sidebar - Chat List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0">
            <h2 className="font-bold text-sm">Messaging</h2>
            <div className="flex gap-2 text-gray-500">
              <MoreHorizontalIcon />
            </div>
          </div>
          <div className="p-2 border-b border-gray-200">
            <div className="bg-gray-100 flex items-center px-2 py-1 rounded">
              <SearchIcon className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search messages"
                className="bg-transparent outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchQuery ? "No users found" : "No users available"}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setActiveChatId(user.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-l-4 ${activeChatId === user.id ? "border-primary bg-blue-50" : "border-transparent"}`}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    className="w-12 h-12 rounded-full"
                    alt={user.username}
                  />
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm truncate">
                      {user.username}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">Traveler</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activeChatId === user.id
                        ? "Active now"
                        : "Click to chat"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="w-2/3 flex flex-col bg-white">
          {activeUser ? (
            <>
              <div className="p-3 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${activeUser.username}&background=random`}
                    className="w-10 h-10 rounded-full"
                    alt={activeUser.username}
                  />
                  <div>
                    <h3 className="font-bold text-sm">{activeUser.username}</h3>
                    <p className="text-xs text-gray-500">Traveler</p>
                  </div>
                </div>
                <MoreHorizontalIcon className="text-gray-500" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm mt-10">
                    No messages yet. Say hi to {activeUser.username}!
                  </div>
                )}
                {messages.map((msg, idx) => {
                  const isMe = msg.from_id === currentUser.id;
                  return (
                    <div
                      key={idx}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 text-sm shadow-sm ${
                          isMe
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="p-3 border-t border-gray-200 bg-white"
              >
                <div className="relative">
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-sm focus:outline-none focus:border-primary resize-none h-24"
                    placeholder={`Write a message to ${activeUser.username}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute bottom-3 right-3 bg-primary text-white p-2 rounded-full disabled:bg-gray-300 hover:bg-blue-700 transition"
                  >
                    <SendIcon className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <h3 className="text-lg font-bold">Select a message</h3>
              <p className="text-center px-4">
                Choose from your existing conversations or start a new one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;

