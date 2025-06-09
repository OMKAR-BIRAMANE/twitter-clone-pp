import Message from '../models/message.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

// Send a direct message
export const sendMessage = async (request, response) => {
    try {
        const { recipientId, content, media } = request.body;
        const senderId = request.user.id; // From auth middleware
        
        // Validate content
        if (!content && (!media || media.length === 0)) {
            return response.status(400).json({ message: 'Message must have content or media' });
        }
        
        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        
        if (!recipient) {
            return response.status(404).json({ message: 'Recipient not found' });
        }
        
        // Generate conversation ID
        const conversationId = Message.generateConversationId(senderId, recipientId);
        
        // Create new message
        const newMessage = new Message({
            sender: senderId,
            recipient: recipientId,
            content,
            media: media || [],
            conversationId
        });
        
        // Save message
        const savedMessage = await newMessage.save();
        
        // Populate sender details for response
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate('sender', '_id name username profilePicture isVerified')
            .populate('recipient', '_id name username profilePicture isVerified');
        
        return response.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error in sendMessage:', error.message);
        return response.status(500).json({ message: 'Error while sending message', error: error.message });
    }
};

// Get conversation between two users
export const getConversation = async (request, response) => {
    try {
        const { userId } = request.params;
        const currentUserId = request.user.id; // From auth middleware
        const { page = 1, limit = 20 } = request.query;
        
        // Check if user exists
        const user = await User.findById(userId);
        
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }
        
        // Generate conversation ID
        const conversationId = Message.generateConversationId(currentUserId, userId);
        
        // Get messages in conversation
        const messages = await Message.find({ conversationId })
            .populate('sender', '_id name username profilePicture isVerified')
            .populate('recipient', '_id name username profilePicture isVerified')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        // Get total count for pagination
        const totalMessages = await Message.countDocuments({ conversationId });
        
        // Mark messages as read if current user is recipient
        await Message.updateMany(
            { 
                conversationId,
                recipient: currentUserId,
                read: false
            },
            { $set: { read: true } }
        );
        
        return response.status(200).json({
            messages: messages.reverse(), // Return in chronological order
            totalPages: Math.ceil(totalMessages / limit),
            currentPage: parseInt(page),
            totalMessages
        });
    } catch (error) {
        console.error('Error in getConversation:', error.message);
        return response.status(500).json({ message: 'Error while getting conversation', error: error.message });
    }
};

// Get all conversations for a user
export const getUserConversations = async (request, response) => {
    try {
        const userId = request.user.id; // From auth middleware
        
        // Find all messages where user is sender or recipient
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: mongoose.Types.ObjectId(userId) },
                        { recipient: mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            // Sort by createdAt to get the latest message per conversation
            { $sort: { createdAt: -1 } },
            // Group by conversationId to get one message per conversation
            {
                $group: {
                    _id: "$conversationId",
                    messageId: { $first: "$_id" },
                    sender: { $first: "$sender" },
                    recipient: { $first: "$recipient" },
                    content: { $first: "$content" },
                    media: { $first: "$media" },
                    read: { $first: "$read" },
                    createdAt: { $first: "$createdAt" }
                }
            },
            // Sort conversations by latest message
            { $sort: { createdAt: -1 } }
        ]);
        
        // Get the other user in each conversation
        const conversationsWithDetails = await Promise.all(messages.map(async (message) => {
            const otherUserId = message.sender.toString() === userId ? 
                message.recipient : message.sender;
            
            const otherUser = await User.findById(otherUserId)
                .select('_id name username profilePicture isVerified');
            
            // Get unread count for this conversation
            const unreadCount = await Message.countDocuments({
                conversationId: message._id,
                recipient: userId,
                read: false
            });
            
            return {
                ...message,
                otherUser,
                unreadCount
            };
        }));
        
        return response.status(200).json(conversationsWithDetails);
    } catch (error) {
        console.error('Error in getUserConversations:', error.message);
        return response.status(500).json({ message: 'Error while getting conversations', error: error.message });
    }
};

// Delete a message
export const deleteMessage = async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.user.id; // From auth middleware
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid message ID' });
        }
        
        // Find message
        const message = await Message.findById(id);
        
        if (!message) {
            return response.status(404).json({ message: 'Message not found' });
        }
        
        // Check if user is the sender
        if (message.sender.toString() !== userId) {
            return response.status(403).json({ message: 'Not authorized to delete this message' });
        }
        
        // Delete message
        await Message.findByIdAndDelete(id);
        
        return response.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error in deleteMessage:', error.message);
        return response.status(500).json({ message: 'Error while deleting message', error: error.message });
    }
};

// Get unread messages count
export const getUnreadMessagesCount = async (request, response) => {
    try {
        const userId = request.user.id; // From auth middleware
        
        // Count unread messages
        const unreadCount = await Message.countDocuments({
            recipient: userId,
            read: false
        });
        
        return response.status(200).json({ unreadCount });
    } catch (error) {
        console.error('Error in getUnreadMessagesCount:', error.message);
        return response.status(500).json({ message: 'Error while getting unread count', error: error.message });
    }
};