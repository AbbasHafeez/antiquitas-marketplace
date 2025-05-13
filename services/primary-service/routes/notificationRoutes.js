const express = require("express")
const router = express.Router()

// Placeholder route handlers
router.get("/", (req, res) => {
  res.json({ message: "Get all notifications route" })
})

router.get("/:id", (req, res) => {
  res.json({ message: `Get notification with ID: ${req.params.id}` })
})

module.exports = router
