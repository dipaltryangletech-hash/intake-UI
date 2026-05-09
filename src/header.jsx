import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, LogOut, User, BookA, FolderPlus } from "lucide-react";
import { useAuth } from "./Context/Auth/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ chat: 4, tasks: 0, documents: 0 });

  useEffect(() => {
    // Re-calculate counts whenever the location changes (user navigates)
    // or when the component mounts.
    const updateCounts = () => {
      // In this app, contextId defaults to 'general' unless specified in location state
      const assignmentId = location.state?.assignmentId || "general";
      const clientId = location.state?.clientId || "anonymous";
      const contextId = assignmentId !== "general" ? assignmentId : `client_${clientId}`;
      const contextKey = contextId.replace('#', '');

      const messagesKey = `chatbot_messages_${contextKey}`;
      const tasksKey = `chatbot_tasks_${contextKey}`;

      // 1. Chat Count (Currently placeholder 4 in chatbot.jsx)
      const pendingChatCount = 4;

      // 2. Task Count (Active tasks)
      let activeTasksCount = 0;
      const savedTasks = localStorage.getItem(tasksKey);
      if (savedTasks) {
        try {
          const tasks = JSON.parse(savedTasks);
          activeTasksCount = tasks.filter(t => !t.completed).length;
        } catch (e) { }
      }

      // 3. Document Count (Pending documents)
      let pendingDocsCount = 0;
      const savedMessages = localStorage.getItem(messagesKey);
      if (savedMessages) {
        try {
          const messages = JSON.parse(savedMessages);
          pendingDocsCount = messages.filter(m => m.type === "document" && m.docStatus === "pending").length;
        } catch (e) { }
      }

      setCounts({
        chat: pendingChatCount,
        tasks: activeTasksCount,
        documents: pendingDocsCount
      });
    };

    updateCounts();

    // Also listen for storage changes in other tabs
    window.addEventListener('storage', updateCounts);
    return () => window.removeEventListener('storage', updateCounts);
  }, [location, location.state]);

  if (!user || location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password' || location.pathname === '/reset-password') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-1 sticky top-0 z-50 h-12">
      {/* LEFT: Logo */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-blue-700">
          Intake Platform
        </Link>
      </div>

      {/* NAV MENU - Only show for Admin */}
      {user.role === 'admin' && (
        <div className="flex gap-6 text-sm font-medium h-full items-center">
          <NavLink
            to="/assignments"
            className={({ isActive }) =>
              `py-3 -mb-px flex items-center h-full border-b-2 transition-colors ${isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
              }`
            }
          >
            Assignments
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `py-3 -mb-px flex items-center h-full border-b-2 transition-colors ${isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
              }`
            }
          >
            Clients
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `py-3 -mb-px flex items-center h-full border-b-2 transition-colors ${isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
              }`
            }
          >
            Users
          </NavLink>
          <NavLink
            to="/masterchecklist"
            className={({ isActive }) =>
              `py-3 -mb-px flex items-center h-full border-b-2 transition-colors ${isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
              }`
            }
          >
            Master Checklist
          </NavLink>
          <NavLink
            to="/documents"
            className={({ isActive }) =>
              `py-3 -mb-px flex items-center h-full border-b-2 transition-colors ${isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
              }`
            }
          >
            Documents
          </NavLink>
        </div>
      )}

      {/* NAV MENU - Only show for Client */}
      {user.role === 'client' && (
        <div className="flex gap-6 text-sm font-medium h-full items-center">

          <NavLink
            to="/assignments"
            className={({ isActive }) =>
              `py-3 -mb-px flex items-center h-full border-b-2 gap-1 transition-colors ${isActive
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-blue-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <BookA size={18} className={isActive ? "text-blue-600" : "text-gray-500"} />
                Assignments
              </>
            )}
          </NavLink>

          {/* ChatBot Section Links */}
          <Link
            to="/chatbot"
            state={{ view: 'chat' }}
            className={`py-3 -mb-px flex items-center h-full border-b-2 gap-1 transition-colors relative ${location.pathname === '/chatbot' && location.state?.view === 'chat'
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-600 hover:text-blue-600"
              }`}
          >
            <MessageCircle size={17} className={location.pathname === '/chatbot' && location.state?.view === 'chat' ? "text-blue-600" : "hover:text-blue-600 text-gray-500"} />
            Chat
            {counts.chat > 0 && (
              <span className="absolute -top-1 -right-3 bg-red-600 text-white text-[9px] font-medium px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-white shadow-sm">
                {counts.chat}
              </span>
            )}
          </Link>

          <Link
            to="/chatbot"
            state={{ view: 'tasks' }}
            className={`py-3 -mb-px flex items-center h-full border-b-2 gap-1 transition-colors relative ${location.pathname === '/chatbot' && location.state?.view === 'tasks'
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-600 hover:text-blue-600"
              }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={location.pathname === '/chatbot' && location.state?.view === 'tasks' ? "text-blue-600" : "hover:text-blue-600 text-gray-500"}
            >
              <path d="M21 12 A 9 9 0 1 0 12 21" />
              <path d="M9 12 l 2.5 2.5 L 16 9" />
              <path d="M19 15 v6 M16 18 h6" />
            </svg>
            Tasks
            {counts.tasks > 0 && (
              <span className="absolute -top-1 -right-3 bg-red-600 text-white text-[9px] font-medium px-1 min-w-[18px] h-[18px]  flex items-center justify-center rounded-full border border-white shadow-sm">
                {counts.tasks}
              </span>
            )}
          </Link>

          <Link
            to="/chatbot"
            state={{ view: 'documents' }}
            className={`py-3 -mb-px flex items-center h-full border-b-2 gap-1 transition-colors relative ${location.pathname === '/chatbot' && location.state?.view === 'documents'
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-600 hover:text-blue-600"
              }`}
          >
            <FolderPlus size={18} className={location.pathname === '/chatbot' && location.state?.view === 'documents' ? "text-blue-600" : "hover:text-blue-600 text-gray-500"} />
            Documents
            {counts.documents > 0 && (
              <span className="absolute -top-1 -right-3 bg-red-600 text-white text-[9px] font-medium px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-white shadow-sm">
                {counts.documents}
              </span>
            )}
          </Link>
        </div>
      )}

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">
        <Link
          to="/profile"
          className="flex items-center gap-3 pr-2 border-r border-gray-200 hover:opacity-80 transition-opacity cursor-pointer group"
        >
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{user.name}</span>
            <span className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">{user.role}</span>
          </div>
          <div className="w-8 h-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold text-xs shadow-sm">
            {getInitials(user.name)}
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs font-bold uppercase tracking-wider"
          title="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
