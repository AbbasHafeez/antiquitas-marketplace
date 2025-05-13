const jwt = require("jsonwebtoken")

/**
 * Set up Socket.IO
 * @param {Object} io - Socket.IO instance
 */
const setupSocketIO = (io) => {
  // Make io available globally
  global.io = io

  // Connection event
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`)
    })
  })
}

module.exports = { setupSocketIO }
