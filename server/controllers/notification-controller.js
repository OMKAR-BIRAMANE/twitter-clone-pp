import Notification from '../models/notification.js';
import mongoose from 'mongoose';

// Get all notifications for a user
export const getUserNotifications = async (request, response) => {
    try {
        const userId = request.user.id; // From auth middleware
        const { page = 1, limit = 20 } = request.query;
        
        // Get notifications for user
        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', '_id name username profilePicture isVerified')
            .populate({
                path: 'tweet',
                populate: {
                    path: 'author',
                    select: '_id name username profilePicture isVerified'
                }
            })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        // Get total count for pagination
        const totalNotifications = await Notification.countDocuments({ recipient: userId });
        
        // Get unread count
        const unreadCount = await Notification.countDocuments({ 
            recipient: userId,
            read: false
        });
        
        return response.status(200).json({
            notifications,
            totalPages: Math.ceil(totalNotifications / limit),
            currentPage: parseInt(page),
            totalNotifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error in getUserNotifications:', error.message);
        return response.status(500).json({ message: 'Error while getting notifications', error: error.message });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.user.id; // From auth middleware
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid notification ID' });
        }
        
        // Find notification
        const notification = await Notification.findById(id);
        
        if (!notification) {
            return response.status(404).json({ message: 'Notification not found' });
        }
        
        // Check if user is the recipient
        if (notification.recipient.toString() !== userId) {
            return response.status(403).json({ message: 'Not authorized to update this notification' });
        }
        
        // Mark as read
        notification.read = true;
        await notification.save();
        
        return response.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error in markNotificationAsRead:', error.message);
        return response.status(500).json({ message: 'Error while updating notification', error: error.message });
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (request, response) => {
    try {
        const userId = request.user.id; // From auth middleware
        
        // Update all unread notifications for user
        const result = await Notification.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true } }
        );
        
        return response.status(200).json({ 
            message: 'All notifications marked as read',
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('Error in markAllNotificationsAsRead:', error.message);
        return response.status(500).json({ message: 'Error while updating notifications', error: error.message });
    }
};

// Delete a notification
export const deleteNotification = async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.user.id; // From auth middleware
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid notification ID' });
        }
        
        // Find notification
        const notification = await Notification.findById(id);
        
        if (!notification) {
            return response.status(404).json({ message: 'Notification not found' });
        }
        
        // Check if user is the recipient
        if (notification.recipient.toString() !== userId) {
            return response.status(403).json({ message: 'Not authorized to delete this notification' });
        }
        
        // Delete notification
        await Notification.findByIdAndDelete(id);
        
        return response.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error in deleteNotification:', error.message);
        return response.status(500).json({ message: 'Error while deleting notification', error: error.message });
    }
};

// Delete all notifications
export const deleteAllNotifications = async (request, response) => {
    try {
        const userId = request.user.id; // From auth middleware
        
        // Delete all notifications for user
        const result = await Notification.deleteMany({ recipient: userId });
        
        return response.status(200).json({ 
            message: 'All notifications deleted successfully',
            count: result.deletedCount
        });
    } catch (error) {
        console.error('Error in deleteAllNotifications:', error.message);
        return response.status(500).json({ message: 'Error while deleting notifications', error: error.message });
    }
};