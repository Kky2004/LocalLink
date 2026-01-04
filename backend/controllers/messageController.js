const messageService =require("../service/messageService");

// Send a message
const sendMessage = async (req, res) => {
  try {
    const sender = req.user; // auth middleware sets req.user
    const { receiverId, content } = req.body;

    const response = await messageService.sendMessage(sender._id, {
      receiverId,
      content,
    });

    res.status(201).json(response);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get conversation with a specific user
 const getConversation = async (req, res) => {
  try {
    const user = req.user;
    const otherUserId = req.params.userId;

    const conversation = await messageService.getConversation(
      user._id,
      otherUserId
    );

    res.json(conversation);
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all messages for logged-in user
 const getUserMessages = async (req, res) => {
  try {
    const user = req.user;

    const messages = await messageService.getUserMessages(user._id);

    res.json(messages);
  } catch (error) {
    console.error("Get user messages error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mark message as read
 const markAsRead = async (req, res) => {
  try {
    const user = req.user;
    const messageId = req.params.messageId;

    await messageService.markAsRead(messageId, user._id);

    res.sendStatus(200);
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get unread message count
 const getUnreadCount = async (req, res) => {
  try {
    const user = req.user;

    const count = await messageService.getUnreadCount(user._id);

    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports={
  sendMessage,
  getConversation,
  getUserMessages,
  markAsRead,
  getUnreadCount,

}