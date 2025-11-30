import React from "react";
import {
  HomeIcon,
  UsersIcon,
  MessageSquareIcon,
  BellIcon,
  UserCircleIcon,
  SearchIcon,
  MapIcon,
} from "./Icons.jsx";
import { AppView } from "../types.js";

const Navbar = ({ currentUser, currentView, setView, onLogout }) => {
  const NavItem = ({ view, icon: Icon, label }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setView(view)}
        className={`flex flex-col items-center px-4 py-2 min-w-[80px] hover:text-gray-900 ${
          isActive
            ? "text-gray-900 border-b-2 border-gray-900"
            : "text-gray-500"
        }`}
      >
        <Icon className={isActive ? "fill-current" : ""} />
        <span className="text-xs mt-1">{label}</span>
      </button>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-[52px]">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-primary text-4xl font-bold select-none cursor-pointer"
            onClick={() => setView(AppView.HOME)}
          >
            T
          </span>
          <div className="hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded w-64">
            <SearchIcon className="text-gray-500 w-4 h-4 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
        </div>

        <div className="flex items-center h-full">
          <NavItem view={AppView.HOME} icon={HomeIcon} label="Home" />
          <NavItem view={AppView.NETWORK} icon={UsersIcon} label="My Network" />
          <div className="flex flex-col items-center px-4 py-2 min-w-[80px] text-gray-500 cursor-not-allowed hidden md:flex">
            <MapIcon />
            <span className="text-xs mt-1">Map</span>
          </div>
          <NavItem
            view={AppView.MESSAGING}
            icon={MessageSquareIcon}
            label="Messaging"
          />

          <div className="flex flex-col items-center px-4 py-2 min-w-[80px] text-gray-500 cursor-not-allowed hidden md:flex">
            <BellIcon />
            <span className="text-xs mt-1">Notifications</span>
          </div>

          <div className="flex flex-col items-center px-4 py-2 min-w-[80px] cursor-pointer group relative">
            <UserCircleIcon className="text-gray-500" />
            <span className="text-xs mt-1 text-gray-500 group-hover:text-gray-900">
              Me
            </span>
            {/* Dropdown for logout */}
            <div className="absolute top-full right-0 bg-white border rounded shadow-lg p-2 hidden group-hover:block w-32">
              <button
                onClick={onLogout}
                className="text-sm text-red-600 hover:bg-gray-100 w-full text-left p-1 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

