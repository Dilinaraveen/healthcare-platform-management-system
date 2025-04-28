// controllers/chatController.js
import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';

// For users to send messages to admin
export const sendMessageToAdmin = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id; // Assuming user auth middleware adds user to req

    if (!message) {
      return res.json({ success: false, message: "Message is required" });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({ userId });
    
    if (!chat) {
      chat = new Chat({
        userId,
        messages: []
      });
    }

    // Add new message
    chat.messages.push({
      sender: 'user',
      message,
      read: false
    });

    await chat.save();
    
    res.json({ 
      success: true, 
      message: "Message sent successfully",
      chat
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// For users to get their chat history with admin
export const getUserChatHistory = async (req, res) => {
  try {
    const userId = req.user._id; // From user auth middleware
    
    const chat = await Chat.findOne({ userId });
    
    if (!chat) {
      return res.json({ 
        success: true, 
        message: "No chat history found",
        chat: { userId, messages: [] }
      });
    }
    
    res.json({ 
      success: true, 
      chat
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// For admin to send messages to user
export const adminSendMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.json({ success: false, message: "User ID and message are required" });
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({ userId });
    
    if (!chat) {
      chat = new Chat({
        userId,
        messages: []
      });
    }

    // Add new message from admin
    chat.messages.push({
      sender: 'admin',
      message,
      read: false
    });

    await chat.save();
    
    res.json({ 
      success: true, 
      message: "Message sent successfully",
      chat
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// For admin to get all chats
export const adminGetAllChats = async (req, res) => {
  try {
    // Optional query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find all chats with user details
    const chats = await Chat.find()
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email'); // Adjust fields based on your User model
    
    // Get total count for pagination
    const totalChats = await Chat.countDocuments();
    
    res.json({ 
      success: true, 
      chats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalChats / limit),
        totalChats
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// For admin to get a specific chat
export const adminGetChat = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    // Find the chat and populate user details
    const chat = await Chat.findOne({ userId }).populate('userId', 'name email');
    
    if (!chat) {
      return res.json({ 
        success: true, 
        message: "No chat found for this user",
        chat: null
      });
    }
    
    // Mark all admin messages as read when admin views the chat
    if (chat.messages.length > 0) {
      chat.messages = chat.messages.map(msg => {
        if (msg.sender === 'user') {
          return { ...msg.toObject(), read: true };
        }
        return msg;
      });
      
      await chat.save();
    }
    
    res.json({ 
      success: true, 
      chat
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// For admin to get unread message counts
export const adminGetUnreadCounts = async (req, res) => {
  try {
    const chats = await Chat.find();
    
    // Calculate unread messages for each chat
    const chatCounts = chats.map(chat => {
      const unreadCount = chat.messages.filter(msg => 
        msg.sender === 'user' && !msg.read
      ).length;
      
      return {
        userId: chat.userId,
        unreadCount
      };
    });
    
    // Calculate total unread messages
    const totalUnread = chatCounts.reduce((sum, chat) => sum + chat.unreadCount, 0);
    
    res.json({ 
      success: true, 
      chatCounts,
      totalUnread
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update user's messages as read
export const markUserMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user._id; // From user auth middleware
    
    const chat = await Chat.findOne({ userId });
    
    if (!chat) {
      return res.json({ 
        success: true, 
        message: "No chat found"
      });
    }
    
    // Mark all admin messages as read
    if (chat.messages.length > 0) {
      chat.messages = chat.messages.map(msg => {
        if (msg.sender === 'admin') {
          return { ...msg.toObject(), read: true };
        }
        return msg;
      });
      
      await chat.save();
    }
    
    res.json({ 
      success: true, 
      message: "Messages marked as read"
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};