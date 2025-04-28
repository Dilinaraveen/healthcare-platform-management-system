// routes/chatRoute.js
import express from 'express';

import { 
  sendMessageToAdmin, 
  getUserChatHistory,
  adminSendMessage,
  adminGetAllChats,
  adminGetChat,
  adminGetUnreadCounts,
  markUserMessagesAsRead
} from '../controllers/chatController.js';
import authUser from '../middlewares/authUser.js';
import authAdmin from '../middlewares/authAdmin.js';

const router = express.Router();

// User routes
router.post('/send', authUser, sendMessageToAdmin);
router.get('/history', authUser, getUserChatHistory);
router.put('/mark-read', authUser, markUserMessagesAsRead);

// Admin routes
router.post('/admin/send', authAdmin, adminSendMessage);
router.get('/admin/all', authAdmin, adminGetAllChats);
router.get('/admin/chat/:userId', authAdmin, adminGetChat);
router.get('/admin/unread', authAdmin, adminGetUnreadCounts);

export default router;