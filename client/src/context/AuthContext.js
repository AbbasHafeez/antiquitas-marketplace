"use client";

import { createContext, useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"
    axios.defaults.baseURL = process.env.REACT_APP_RARITY_SERVICE_URL || "http://localhost:5002"
  }, []);

  const setAuthToken = (tok) => {
    if (tok) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${tok}`;
      localStorage.setItem("token", tok);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  };

  const isTokenExpired = (tok) => {
    try {
      const { exp } = jwt_decode(tok);
      return exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const loadUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);

    try {
      const { data } = await axios.get("/api/auth/me");
      setUser(data.user || data);
      setIsAuthenticated(true);
    } catch (err) {
      logout();
      setError(err.response?.data?.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await axios.post("/api/auth/register", formData);
      setToken(data.token);
      setAuthToken(data.token);
      await loadUser();
      toast.success("Registration successful!");
      return { success: true, role: data.role || data.user?.role };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      toast.error(msg);
      return { success: false };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      setToken(data.token);
      setAuthToken(data.token);
      await loadUser();
      toast.success("Login successful!");
      const decoded = jwt_decode(data.token);
      return { success: true, role: decoded.role };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
      return { success: false };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthToken(null);
    toast.info("You have been logged out");
  };

  const updateProfile = async (formData) => {
    try {
      const { data } = await axios.put("/api/users/profile", formData);
      setUser(data.user || data);
      //toast.success("Profile updated successfully!");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Profile update failed";
      setError(msg);
      toast.error(msg);
      return false;
    }
  };

  const hasRole = (role) => user?.role === role;

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      if (newToken) {
        setToken(newToken);
        if (!isTokenExpired(newToken)) {
          setAuthToken(newToken);
          loadUser();
        } else {
          logout();
        }
      } else {
        logout();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    if (token && !isTokenExpired(token)) {
      setAuthToken(token);
      loadUser();
    } else {
      setLoading(false);
      if (token) {
        logout();
        toast.error("Session expired, please log in again.");
      }
    }

    return () => window.removeEventListener("storage", handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        hasRole,
        loadUser, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
