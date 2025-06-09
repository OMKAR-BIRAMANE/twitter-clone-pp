import User from '../models/user.js';
import Tweet from '../models/tweet.js';
import Notification from '../models/notification.js';
import mongoose from 'mongoose';

// Get user profile by username
export const getUserByUsername = async (request, response) => {
    try {
        const username = request.params.username;
        
        const user = await User.findOne({ username })
            .select('-password') // Exclude password from the response
            .populate('followers', '_id name username profilePicture')
            .populate('following', '_id name username profilePicture');
        
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }
        
        return response.status(200).json(user);
    } catch (error) {
        console.error('Error in getUserByUsername:', error.message);
        return response.status(500).json({ message: 'Error while getting user profile', error: error.message });
    }
};

// Get user by ID
export const getUserById = async (request, response) => {
    try {
        const userId = request.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).json({ message: 'Invalid user ID' });
        }
        
        const user = await User.findById(userId)
            .select('-password')
            .populate('followers', '_id name username profilePicture')
            .populate('following', '_id name username profilePicture');
        
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }
        
        return response.status(200).json(user);
    } catch (error) {
        console.error('Error in getUserById:', error.message);
        return response.status(500).json({ message: 'Error while getting user profile', error: error.message });
    }
};

// Get all users (with pagination and search)
export const getAllUsers = async (request, response) => {
    try {
        const { page = 1, limit = 10, search = '' } = request.query;
        
        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } }
                ]
            }
            : {};
        
        const users = await User.find(query)
            .select('_id name username bio profilePicture isVerified')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });
        
        const totalUsers = await User.countDocuments(query);
        
        return response.status(200).json({
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: parseInt(page),
            totalUsers
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error.message);
        return response.status(500).json({ message: 'Error while getting users', error: error.message });
    }
};

// Follow a user
export const followUser = async (request, response) => {
    try {
        const { id: followId } = request.params;
        const userId = request.user.id; // From auth middleware
        
        // Check if IDs are valid
        if (!mongoose.Types.ObjectId.isValid(followId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).json({ message: 'Invalid user ID' });
        }
        
        // Check if user is trying to follow themselves
        if (followId === userId) {
            return response.status(400).json({ message: 'You cannot follow yourself' });
        }
        
        // Find both users
        const userToFollow = await User.findById(followId);
        const currentUser = await User.findById(userId);
        
        if (!userToFollow || !currentUser) {
            return response.status(404).json({ message: 'User not found' });
        }
        
        // Check if already following
        if (currentUser.following.includes(followId)) {
            return response.status(400).json({ message: 'You are already following this user' });
        }
        
        // Update both users
        await User.findByIdAndUpdate(followId, { $push: { followers: userId } });
        await User.findByIdAndUpdate(userId, { $push: { following: followId } });
        
        // Create notification
        const notification = new Notification({
            recipient: followId,
            sender: userId,
            type: 'follow'
        });
        
        await notification.save();
        
        return response.status(200).json({ message: `You are now following ${userToFollow.username}` });
    } catch (error) {
        console.error('Error in followUser:', error.message);
        return response.status(500).json({ message: 'Error while following user', error: error.message });
    }
};

// Unfollow a user
export const unfollowUser = async (request, response) => {
    try {
        const { id: unfollowId } = request.params;
        const userId = request.user.id; // From auth middleware
        
        // Check if IDs are valid
        if (!mongoose.Types.ObjectId.isValid(unfollowId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return response.status(400).json({ message: 'Invalid user ID' });
        }
        
        // Check if user is trying to unfollow themselves
        if (unfollowId === userId) {
            return response.status(400).json({ message: 'You cannot unfollow yourself' });
        }
        
        // Find both users
        const userToUnfollow = await User.findById(unfollowId);
        const currentUser = await User.findById(userId);
        
        if (!userToUnfollow || !currentUser) {
            return response.status(404).json({ message: 'User not found' });
        }
        
        // Check if not following
        if (!currentUser.following.includes(unfollowId)) {
            return response.status(400).json({ message: 'You are not following this user' });
        }
        
        // Update both users
        await User.findByIdAndUpdate(unfollowId, { $pull: { followers: userId } });
        await User.findByIdAndUpdate(userId, { $pull: { following: unfollowId } });
        
        return response.status(200).json({ message: `You have unfollowed ${userToUnfollow.username}` });
    } catch (error) {
        console.error('Error in unfollowUser:', error.message);
        return response.status(500).json({ message: 'Error while unfollowing user', error: error.message });
    }
};

// Update user profile
export const updateUserProfile = async (request, response) => {
    try {
        const userId = request.user.id; // From auth middleware
        const { name, bio, location, website } = request.body;
        
        // Find user
        const user = await User.findById(userId);
        
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }
        
        // Update fields
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;
        if (website !== undefined) user.website = website;
        
        // Save updated user
        const updatedUser = await user.save();
        
        return response.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                bio: updatedUser.bio,
                location: updatedUser.location,
                website: updatedUser.website,
                profilePicture: updatedUser.profilePicture,
                coverPicture: updatedUser.coverPicture,
                isVerified: updatedUser.isVerified
            }
        });
    } catch (error) {
        console.error('Error in updateUserProfile:', error.message);
        return response.status(500).json({ message: 'Error while updating profile', error: error.message });
    }
};

// Get user's followers
export const getUserFollowers = async (request, response) => {
    try {
        const { username } = request.params;
        
        const user = await User.findOne({ username })
            .populate('followers', '_id name username bio profilePicture isVerified');
        
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }
        
        return response.status(200).json(user.followers);
    } catch (error) {
        console.error('Error in getUserFollowers:', error.message);
        return response.status(500).json({ message: 'Error while getting followers', error: error.message });
    }
};

// Get user's following
export const getUserFollowing = async (request, response) => {
    try {
        const { username } = request.params;
        
        const user = await User.findOne({ username })
            .populate('following', '_id name username bio profilePicture isVerified');
        
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }
        
        return response.status(200).json(user.following);
    } catch (error) {
        console.error('Error in getUserFollowing:', error.message);
        return response.status(500).json({ message: 'Error while getting following', error: error.message });
    }
};