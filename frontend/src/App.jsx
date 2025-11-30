import React, { useState, useEffect } from "react";
import Login from "./components/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import Feed from "./components/Feed.jsx";
import Network from "./components/Network.jsx";
import Messaging from "./components/Messaging.jsx";
import { api } from "./services/api.js";
import { AppView } from "./types.js";

const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState(AppView.HOME);
  const [messagingTargetId, setMessagingTargetId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("travelsdin_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("travelsdin_user", JSON.stringify(loggedInUser));
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    localStorage.removeItem("travelsdin_user");
    setCurrentView(AppView.HOME);
  };

  const navigateToMessage = (userId) => {
    setMessagingTargetId(userId);
    setCurrentView(AppView.MESSAGING);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] pb-10">
      <Navbar
        currentUser={user}
        currentView={currentView}
        setView={(view) => {
          setCurrentView(view);
          // Reset message target if navigating away or clicking Messaging nav directly
          if (view !== AppView.MESSAGING) setMessagingTargetId(null);
        }}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-0 md:px-4">
        {currentView === AppView.HOME && <Feed currentUser={user} />}
        {currentView === AppView.NETWORK && (
          <Network onMessageClick={navigateToMessage} />
        )}
        {currentView === AppView.MESSAGING && (
          <Messaging currentUser={user} initialChatId={messagingTargetId} />
        )}
      </main>
    </div>
  );
};

export default App;

