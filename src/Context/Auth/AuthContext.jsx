import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate ,useLocation} from 'react-router-dom'; 
import { postData } from '../../utils/api';
import ENDPOINT from '../../const/endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState(() => {
    const defaultUsers = [
      { email: "admin@gmail.com", password: "123", role: "admin", name: "Admin User" },
      { email: "client@gmail.com", password: "123", role: "client", name: "Client User" }
    ];

    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        // Ensure defaults are always present, merge with saved users
        const merged = [...defaultUsers];
        if (Array.isArray(parsed)) {
          parsed.forEach(u => {
            if (!merged.find(d => d.email === u.email)) {
              merged.push(u);
            }
          });
        }
        return merged;
      } catch (e) {
        console.error("Failed to parse users from localStorage", e);
      }
    }
    return defaultUsers;
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = async (email, password) => {
    console.log("Attempting local login with:", email, password);
    /* 
    // API Authentication disabled to prevent console ERR_FAILED errors 
    // as no backend server is currently active.
    try {
      const res = await postData(ENDPOINT.auth.Login, { email, password })
      console.log("Login API response:", res)
    } catch (error) {
      console.error("Login API call failed:", error);
    }
    */

    const foundUser = users.find(u => u.email === email && u.password === password);
    console.log("Local user match result:", foundUser)

    if (foundUser) {
      setUser(foundUser);
      return { success: true, user: foundUser };
    }
    return { success: false, message: "Invalid email or password" };
  };

  const signup = async (userData) => {
    console.log("Attempting local signup with:", userData);
    /*
    // API Signup disabled to prevent console ERR_FAILED errors
    try {
      const res = await postData(ENDPOINT.auth.Signup, userData);
      console.log("Signup API response:", res)
    } catch (error) {
      console.error("Signup API call failed:", error);
    }
    */

    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: "User with this email already exists" };
    }

    // Add user locally
    const newUser = { ...userData };
    setUsers([...users, newUser]);
    return { success: true, message: "User created successfully" };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
