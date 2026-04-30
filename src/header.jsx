import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, LogOut, User } from "lucide-react";
import { useAuth } from "./AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide header on login and signup pages
  if (!user || location.pathname === '/login' || location.pathname === '/signup') {
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
    <div className="flex justify-between items-center bg-white shadow px-6 sticky top-0 z-50 h-10">
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
              `py-3 -mb-px flex items-center h-full border-b-2 transition-colors ${isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
              }`
            }
          >
            Assignments
          </NavLink>

          {/* ChatBot Section Links */}
          <Link
            to="/chatbot"
            state={{ view: 'chat' }}
            className={`py-3 -mb-px flex items-center h-full border-b-2 transition-colors ${location.pathname === '/chatbot' && location.state?.view === 'chat'
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
              }`}
          >
            Chat
          </Link>

          <Link
            to="/chatbot"
            state={{ view: 'tasks' }}
            className={`py-3 -mb-px flex items-center h-full border-b-2 transition-colors ${location.pathname === '/chatbot' && location.state?.view === 'tasks'
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
              }`}
          >
            Tasks
          </Link>

          <Link
            to="/chatbot"
            state={{ view: 'documents' }}
            className={`py-3 -mb-px flex items-center h-full border-b-2 transition-colors ${location.pathname === '/chatbot' && location.state?.view === 'documents'
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-blue-600"
              }`}
          >
            Documents
          </Link>
        </div>
      )}

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">
        <Link
          to={user.role === 'admin' ? "/userdetails" : "/clientportal"}
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
