const Message =require("../models/messageModel");
const User =require("../models/userModel");

class MessageService {
  // Send a message
  async sendMessage(senderId, request) {
    const { receiverId, content } = request;

    const sender = await User.findById(senderId);
    if (!sender) throw new Error("Sender not found");

    const receiver = await User.findById(receiverId);
    if (!receiver) throw new Error("Receiver not found");

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      isRead: false,
    });

    const savedMessage = await message.save();
    return this.mapToResponse(savedMessage, sender, receiver);
  }

  // Get conversation between two users
  async getConversation(user1Id, user2Id) {
    const messages = await Message.find({
      $or: [
        { sender: user1Id, receiver: user2Id },
        { sender: user2Id, receiver: user1Id },
      ],
    }).sort({ createdAt: 1 });

    return Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findById(msg.sender);
        const receiver = await User.findById(msg.receiver);
        return this.mapToResponse(msg, sender, receiver);
      })
    );
  }

  // Get all messages for a user
  async getUserMessages(userId) {
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });
      
    return Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findById(msg.sender);
        const receiver = await User.findById(msg.receiver);
        return this.mapToResponse(msg, sender, receiver);
      })
    );
  }

  // Mark message as read
  async markAsRead(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) throw new Error("Message not found");

    if (message.receiver.toString() !== userId.toString()) {
      throw new Error("Unauthorized to mark this message as read");
    }

    message.isRead = true;
    await message.save();
  }

  // Get unread message count for user
  async getUnreadCount(userId) {
    return Message.countDocuments({
      receiver: userId,
      isRead: false,
    });
  }

  // Convert DB object to response object
  mapToResponse(message, sender, receiver) {
    return {
      id: message._id,
      senderId: sender?._id || message.sender,
      senderName: sender?.name || "",
      receiverId: receiver?._id || message.receiver,
      receiverName: receiver?.name || "",
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
    };
  }
}

module.exports= new MessageService();
