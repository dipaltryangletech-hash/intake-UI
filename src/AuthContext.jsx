import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState(() => {
    const initialUsers = [
      { email: "admin@test.com", password: "123", role: "admin", name: "Admin User" },
      { email: "client@test.com", password: "123", role: "client", name: "Client User" }
    ];
    return initialUsers;
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
  console.log("test")
  const login = (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    console.log(foundUser)
    if (foundUser) {
      setUser(foundUser);
      return { success: true, user: foundUser };
    }
    return { success: false, message: "Invalid email or password" };
  };

  const signup = (userData) => {
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: "User already exists" };
    }
    const newUser = { ...userData, id: Date.now() };
    setUsers([...users, newUser]);
    return { success: true };
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
