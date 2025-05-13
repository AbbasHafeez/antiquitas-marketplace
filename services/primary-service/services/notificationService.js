const Notification = require("../models/Notification")
const User = require("../models/User")

/**
 * Send a notification to a user
 * @param {string} userId - The ID of the user to send the notification to
 * @param {Object} notificationData - The notification data
 * @param {string} notificationData.type - The type of notification
 * @param {string} notificationData.message - The notification message
 * @param {string} [notificationData.orderId] - Optional order ID
 * @param {string} [notificationData.productId] - Optional product ID
 * @returns {Promise<Object>} The created notification
 */
const sendNotification = async (userId, notificationData) => {
  try {
    // Check if user exists
    const userExists = await User.exists({ _id: userId })
    if (!userExists) {
      throw new Error(`User with ID ${userId} not found`)
    }

    // Create notification
    const notification = new Notification({
      user: userId,
      type: notificationData.type,
      message: notificationData.message,
      orderId: notificationData.orderId,
      productId: notificationData.productId,
    })

    const savedNotification = await notification.save()

    // Emit socket event if socket.io is set up
    if (global.io) {
      global.io.to(userId.toString()).emit("notification", savedNotification)
    }

    return savedNotification
  } catch (error) {
    console.error("Error sending notification:", error)
    throw error
  }
}

/**
 * Send an order notification to a user
 * @param {string} userId - The ID of the user to send the notification to
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Object>} The created notification
 */
const sendOrderNotification = async (userId, notificationData) => {
  return sendNotification(userId, {
    type: notificationData.type,
    message: notificationData.message,
    orderId: notificationData.orderId,
  })
}

/**
 * Send a product notification to a user
 * @param {string} userId - The ID of the user to send the notification to
 * @param {Object} notificationData - The notification data
 * @returns {Promise<Object>} The created notification
 */
const sendProductNotification = async (userId, notificationData) => {
  return sendNotification(userId, {
    type: notificationData.type,
    message: notificationData.message,
    productId: notificationData.productId,
  })
}

/**
 * Mark a notification as read
 * @param {string} notificationId - The ID of the notification to mark as read
 * @param {string} userId - The ID of the user who owns the notification
 * @returns {Promise<Object>} The updated notification
 */
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    })

    if (!notification) {
      throw new Error("Notification not found or does not belong to user")
    }

    notification.isRead = true
    return await notification.save()
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The result of the update operation
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    return await Notification.updateMany({ user: userId, isRead: false }, { isRead: true })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

module.exports = {
  sendNotification,
  sendOrderNotification,
  sendProductNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
}
