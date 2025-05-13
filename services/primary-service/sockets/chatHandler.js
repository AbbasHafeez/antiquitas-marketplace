const mongoose = require("mongoose")
const User = require("../models/User")

/**
 * Handle chat-related socket events
 * @param {Object} io - Socket.IO instance
 * @param {Object} socket - Socket instance
 */
module.exports = (io, socket) => {
  // Join a chat room
  socket.on("joinChatRoom", (roomId) => {
    socket.join(roomId)
    console.log(`User ${socket.user._id} joined chat room: ${roomId}`)
  })

  // Leave a chat room
  socket.on("leaveChatRoom", (roomId) => {
    socket.leave(roomId)
    console.log(`User ${socket.user._id} left chat room: ${roomId}`)
  })

  // Send a message
  socket.on("sendMessage", async (data, callback) => {
    try {
      const { recipientId, message } = data

      // Validate recipient
      const recipient = await User.findById(recipientId)
      if (!recipient) {
        return callback({ success: false, error: "Recipient not found" })
      }

      // Create a unique room ID for the conversation
      const participants = [socket.user._id.toString(), recipientId].sort()
      const roomId = `chat_${participants.join("_")}`

      // Create message object
      const messageObj = {
        _id: new mongoose.Types.ObjectId(),
        sender: socket.user._id,
        recipient: recipientId,
        message,
        createdAt: new Date(),
      }

      // Emit message to the room
      io.to(roomId).emit("newMessage", messageObj)

      // Also send to recipient's personal room in case they're not in the chat room
      io.to(recipientId).emit("newMessage", messageObj)

      // Send notification to recipient
      const notificationService = require("../services/notificationService")
      await notificationService.sendNotification(recipientId, {
        type: "new_message",
        message: `New message from ${socket.user.name}`,
      })

      callback({ success: true, message: messageObj })
    } catch (error) {
      console.error("Error sending message:", error)
      callback({ success: false, error: error.message })
    }
  })

  // User is typing
  socket.on("typing", (data) => {
    const { roomId } = data
    socket.to(roomId).emit("userTyping", {
      user: socket.user._id,
      name: socket.user.name,
    })
  })

  // User stopped typing
  socket.on("stopTyping", (data) => {
    const { roomId } = data
    socket.to(roomId).emit("userStoppedTyping", {
      user: socket.user._id,
    })
  })
}
