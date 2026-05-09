import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, LogOut, User, BookA, FolderPlus, Menu, X } from "lucide-react";
import { useAuth } from "./Context/Auth/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ chat: 4, tasks: 0, documents: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);


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

  const closeMenu = () => setIsMenuOpen(false);
  return (
    <>
      <div className="flex justify-between items-center bg-white shadow px-6 py-1 sticky top-0 z-40 h-14">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-blue-700">
            Intake Platform
          </Link>
        </div>

        {/* DESKTOP NAV MENU - Admin (Hidden on Mobile/Tablet) */}
        {user.role === "admin" && (
          <div className="hidden lg:flex gap-6 text-sm font-medium h-full items-center">
            {["Assignments", "Clients", "Users", "Master Checklist", "Documents"].map((item) => (
              <NavLink
                key={item}
                to={`/${item.replace(" ", "").toLowerCase()}`}
                className={({ isActive }) =>
                  `py-7  flex items-center h-full border-b-2 transition-colors ${isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-blue-600"
                  }`
                }
              >
                {item}
              </NavLink>
            ))}
          </div>
        )}

        {/* DESKTOP NAV MENU - Client (Hidden on Mobile/Tablet) */}
        {user.role === "client" && (
          <div className="hidden lg:flex gap-6 text-sm font-medium h-full items-center">
            <NavLink
              to="/assignments"
              className={({ isActive }) =>
                `py-7 -mb-px flex items-center h-full border-b-2 gap-1 transition-colors ${isActive
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

            {/* Chat */}
            <Link
              to="/chatbot"
              state={{ view: "chat" }}
              className={`py-7 -mb-px flex items-center h-full border-b-2 gap-1 transition-colors relative ${location.pathname === "/chatbot" && location.state?.view === "chat"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-blue-600"
                }`}
            >
              <MessageCircle
                size={17}
                className={
                  location.pathname === "/chatbot" && location.state?.view === "chat"
                    ? "text-blue-600"
                    : "text-gray-500"
                }
              />
              Chat
              {counts.chat > 0 && (
                <span className="absolute top-2 -right-3 bg-red-600 text-white text-[9px] font-medium px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-white shadow-sm">
                  {counts.chat}
                </span>
              )}
            </Link>

            {/* Tasks */}
            <Link
              to="/chatbot"
              state={{ view: "tasks" }}
              className={`py-7 -mb-px flex items-center h-full border-b-2 gap-1 transition-colors relative ${location.pathname === "/chatbot" && location.state?.view === "tasks"
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
                className={
                  location.pathname === "/chatbot" && location.state?.view === "tasks"
                    ? "text-blue-600"
                    : "text-gray-500"
                }
              >
                <path d="M21 12 A 9 9 0 1 0 12 21" />
                <path d="M9 12 l 2.5 2.5 L 16 9" />
                <path d="M19 15 v6 M16 18 h6" />
              </svg>
              Tasks
              {counts.tasks > 0 && (
                <span className="absolute top-2 -right-3 bg-red-600 text-white text-[9px] font-medium px-1 min-w-[18px] h-[18px]  flex items-center justify-center rounded-full border border-white shadow-sm">
                  {counts.tasks}
                </span>
              )}
            </Link>

            {/* Documents */}
            <Link
              to="/chatbot"
              state={{ view: "documents" }}
              className={`py-7 -mb-px flex items-center h-full border-b-2 gap-1 transition-colors relative ${location.pathname === "/chatbot" && location.state?.view === "documents"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-blue-600"
                }`}
            >
              <FolderPlus
                size={18}
                className={
                  location.pathname === "/chatbot" && location.state?.view === "documents"
                    ? "text-blue-600"
                    : "text-gray-500"
                }
              />
              Documents
              {counts.documents > 0 && (
                <span className="absolute top-2 -right-3 bg-red-600 text-white text-[9px] font-medium px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-white shadow-sm">
                  {counts.documents}
                </span>
              )}
            </Link>
          </div>
        )}

        {/* RIGHT SIDE DESKTOP (Hidden on Mobile/Tablet) */}
        <div className="hidden lg:flex items-center gap-5">
          <Link
            to="/profile"
            className="flex items-center gap-3 pr-2 border-r border-gray-200 hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {user.name}
              </span>
              <span className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">
                {user.role}
              </span>
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

        {/* MOBILE/TABLET HAMBURGER BUTTON (Visible only on lg:hidden) */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* MOBILE/TABLET SIDEBAR OVERLAY */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity lg:hidden"
          onClick={closeMenu}
        ></div>
      )}

      {/* MOBILE/TABLET SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-[60] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-blue-700">Menu</span>
          <button
            onClick={closeMenu}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
          {/* Mobile Admin Links */}
          {user.role === "admin" &&
            ["Assignments", "Clients", "Users", "Master Checklist", "Documents"].map((item) => (
              <NavLink
                key={item}
                to={`/${item.replace(" ", "").toLowerCase()}`}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                {item}
              </NavLink>
            ))}

          {/* Mobile Client Links */}
          {user.role === "client" && (
            <>
              <NavLink
                to="/assignments"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <BookA size={18} />
                Assignments
              </NavLink>

              <Link
                to="/chatbot"
                state={{ view: "chat" }}
                onClick={closeMenu}
                className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === "/chatbot" && location.state?.view === "chat"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={18} />
                  Chat
                </div>
                {counts.chat > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {counts.chat}
                  </span>
                )}
              </Link>

              <Link
                to="/chatbot"
                state={{ view: "tasks" }}
                onClick={closeMenu}
                className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === "/chatbot" && location.state?.view === "tasks"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12 A 9 9 0 1 0 12 21" />
                    <path d="M9 12 l 2.5 2.5 L 16 9" />
                    <path d="M19 15 v6 M16 18 h6" />
                  </svg>
                  Tasks
                </div>
                {counts.tasks > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {counts.tasks}
                  </span>
                )}
              </Link>

              <Link
                to="/chatbot"
                state={{ view: "documents" }}
                onClick={closeMenu}
                className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === "/chatbot" && location.state?.view === "documents"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FolderPlus size={18} />
                  Documents
                </div>
                {counts.documents > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {counts.documents}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Profile & Logout */}
        <div className="p-4 border-t border-gray-100 flex flex-col gap-3">
          <Link
            to="/profile"
            onClick={closeMenu}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center rounded-full font-bold text-sm">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">{user.name}</span>
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 mt-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-bold uppercase tracking-wider text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
