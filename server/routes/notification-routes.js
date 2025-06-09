import express from 'express';
import { 
    getUserNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification, 
    deleteAllNotifications 
} from '../controllers/notification-controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All notification routes require authentication
router.get('/', authenticateToken, getUserNotifications);
router.put('/:id/read', authenticateToken, markNotificationAsRead);
router.put('/read-all', authenticateToken, markAllNotificationsAsRead);
router.delete('/:id', authenticateToken, deleteNotification);
router.delete('/', authenticateToken, deleteAllNotifications);

export default router;