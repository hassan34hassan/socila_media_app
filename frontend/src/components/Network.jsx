import React, { useEffect, useState } from "react";
import { api } from "../services/api.js";

const Network = ({ onMessageClick }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pt-6 px-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-center text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto pt-6 px-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-center text-red-500">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-2 text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-6 px-4">
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Manage my network
        </h2>
        <div className="mt-2 text-gray-500 flex items-center gap-2">
          <span className="font-bold text-black">0</span> Connections
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          People you may know ({users.length})
        </h2>

        {users.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No other users found. Invite friends to join!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="border border-gray-200 rounded-lg overflow-hidden flex flex-col relative pb-4"
              >
                <div className="h-16 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className="flex flex-col items-center -mt-8 px-2 flex-grow">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.username}&background=random&size=128`}
                    alt={user.username}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-md"
                  />
                  <h3 className="font-bold mt-2 text-center text-gray-900">
                    {user.username}
                  </h3>
                  <p className="text-xs text-gray-500 text-center">Traveler</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {user.connections || 0} connections
                  </p>
                </div>
                <div className="px-4 mt-4 space-y-2">
                  <button className="w-full border border-primary text-primary hover:bg-blue-50 font-bold py-1 rounded-full text-sm transition">
                    Connect
                  </button>
                  <button
                    onClick={() => onMessageClick(user.id)}
                    className="w-full border border-gray-500 text-gray-600 hover:bg-gray-100 font-bold py-1 rounded-full text-sm transition"
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;

