const express =require("express");
const {
  sendMessage,
  getConversation,
  getUserMessages,
  markAsRead,
  getUnreadCount
} =require("../controllers/messageController.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = express.Router();

// Protected routes
router.post('/', authMiddleware, sendMessage);
router.get('/conversation/:userId', authMiddleware, getConversation);
router.get('/', authMiddleware, getUserMessages);
router.put('/:messageId/read', authMiddleware, markAsRead);
router.get('/unread-count', authMiddleware, getUnreadCount);

module.exports = router;
