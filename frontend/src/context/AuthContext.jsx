import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // On mount, if a token exists, restore the session by fetching the user.
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await api.getMe();
        if (!cancelled) setUser(me);
      } catch {
        api.setToken(null); // token invalid/expired — drop it
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const data = await api.register({ name, email, password });
    api.setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await api.login({ email, password });
    api.setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, ready, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
