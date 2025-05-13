const Notification = require("../models/Notification")

/**
 * Handle notification-related socket events
 * @param {Object} io - Socket.IO instance
 * @param {Object} socket - Socket instance
 */
module.exports = (io, socket) => {
  // Get unread notifications count
  socket.on("getUnreadNotificationsCount", async (callback) => {
    try {
      const count = await Notification.countDocuments({
        user: socket.user._id,
        isRead: false,
      })
      callback({ success: true, count })
    } catch (error) {
      console.error("Error getting unread notifications count:", error)
      callback({ success: false, error: error.message })
    }
  })

  // Get recent notifications
  socket.on("getRecentNotifications", async (callback) => {
    try {
      const notifications = await Notification.find({ user: socket.user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("orderId", "totalPrice")
        .populate("productId", "name images")

      callback({ success: true, notifications })
    } catch (error) {
      console.error("Error getting recent notifications:", error)
      callback({ success: false, error: error.message })
    }
  })

  // Mark notification as read
  socket.on("markNotificationAsRead", async (notificationId, callback) => {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        user: socket.user._id,
      })

      if (!notification) {
        return callback({
          success: false,
          error: "Notification not found or does not belong to user",
        })
      }

      notification.isRead = true
      await notification.save()

      callback({ success: true })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      callback({ success: false, error: error.message })
    }
  })

  // Mark all notifications as read
  socket.on("markAllNotificationsAsRead", async (callback) => {
    try {
      await Notification.updateMany({ user: socket.user._id, isRead: false }, { isRead: true })

      callback({ success: true })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      callback({ success: false, error: error.message })
    }
  })
}
