import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const rawUser = localStorage.getItem("usuario");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      const rawToken = localStorage.getItem("token");
      return rawToken || null;
    } catch {
      return null;
    }
  });

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    try {
      localStorage.setItem("usuario", JSON.stringify(userData));
      localStorage.setItem("token", jwtToken || "");
    } catch {}
    window.dispatchEvent(new Event("storage"));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
    } catch {}
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
