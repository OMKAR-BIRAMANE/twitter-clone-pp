import express from 'express';
import { 
    sendMessage, 
    getConversation, 
    getUserConversations, 
    deleteMessage, 
    getUnreadMessagesCount 
} from '../controllers/message-controller.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// All message routes require authentication
router.post('/', authenticateToken, upload.array('media', 4), sendMessage);
router.get('/conversation/:userId', authenticateToken, getConversation);
router.get('/conversations', authenticateToken, getUserConversations);
router.delete('/:id', authenticateToken, deleteMessage);
router.get('/unread', authenticateToken, getUnreadMessagesCount);

export default router;