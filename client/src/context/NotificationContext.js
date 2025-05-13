"use client";

import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

/* helper so we never call .map on non-arrays */
const safeArray = (d) => (Array.isArray(d) ? d : []);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ───────── fetch when auth state changes ───────── */
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  /* ───────── mock socket for live notifications ─────────
     In production you’d use socket.io or SSE here.        */
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log("Setting up notification socket for user:", user._id);

    const id = setInterval(() => {
      /* pretend we got nothing – this is just a placeholder */
    }, 60_000);

    return () => clearInterval(id);
  }, [isAuthenticated, user]);

  /* ───────── API helpers ───────── */
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/notifications");
      const list = safeArray(data);
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((c) => {
        const wasUnread = notifications.find((n) => n._id === id && !n.isRead);
        return wasUnread ? Math.max(0, c - 1) : c;
      });
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  /* ───────── context value ───────── */
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
