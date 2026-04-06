import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("medclear-token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("medclear-user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(tokenValue, userData) {
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem("medclear-token", tokenValue);
    localStorage.setItem("medclear-user", JSON.stringify(userData));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("medclear-token");
    localStorage.removeItem("medclear-user");
  }

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
