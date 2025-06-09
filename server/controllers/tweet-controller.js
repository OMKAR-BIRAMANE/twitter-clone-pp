import Tweet from '../models/tweet.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import mongoose from 'mongoose';

// Create a new tweet
export const createTweet = async (request, response) => {
    try {
        const { content, media, hashtags, mentions, isReply, parentTweet, isQuote, quotedTweet } = request.body;
        const userId = request.user.id; // From auth middleware

        // Validate content
        if (!content && (!media || media.length === 0)) {
            return response.status(400).json({ message: 'Tweet must have content or media' });
        }

        if (content && content.length > 280) {
            return response.status(400).json({ message: 'Tweet content cannot exceed 280 characters' });
        }

        // Create new tweet
        const newTweet = new Tweet({
            content,
            author: userId,
            media: media || [],
            hashtags: hashtags || [],
            mentions: mentions || [],
            isReply: isReply || false,
            parentTweet: isReply ? parentTweet : null,
            isQuote: isQuote || false,
            quotedTweet: isQuote ? quotedTweet : null
        });

        // Save tweet
        const savedTweet = await newTweet.save();

        // Update user's tweets array
        await User.findByIdAndUpdate(userId, { $push: { tweets: savedTweet._id } });

        // If it's a reply, update the parent tweet's replies array
        if (isReply && parentTweet) {
            await Tweet.findByIdAndUpdate(parentTweet, { $push: { replies: savedTweet._id } });

            // Get parent tweet to find its author
            const parentTweetDoc = await Tweet.findById(parentTweet);
            
            // Create notification for reply (if not replying to own tweet)
            if (parentTweetDoc && parentTweetDoc.author.toString() !== userId) {
                const notification = new Notification({
                    recipient: parentTweetDoc.author,
                    sender: userId,
                    type: 'reply',
                    tweet: savedTweet._id
                });
                
                await notification.save();
            }
        }

        // If it's a quote tweet, create notification
        if (isQuote && quotedTweet) {
            const quotedTweetDoc = await Tweet.findById(quotedTweet);
            
            if (quotedTweetDoc && quotedTweetDoc.author.toString() !== userId) {
                const notification = new Notification({
                    recipient: quotedTweetDoc.author,
                    sender: userId,
                    type: 'quote',
                    tweet: savedTweet._id
                });
                
                await notification.save();
            }
        }

        // Create notifications for mentions
        if (mentions && mentions.length > 0) {
            const mentionPromises = mentions.map(async (mentionId) => {
                // Don't notify if mentioning self
                if (mentionId.toString() === userId) return;
                
                const notification = new Notification({
                    recipient: mentionId,
                    sender: userId,
                    type: 'mention',
                    tweet: savedTweet._id
                });
                
                return notification.save();
            });
            
            await Promise.all(mentionPromises);
        }

        // Populate author details for response
        const populatedTweet = await Tweet.findById(savedTweet._id)
            .populate('author', '_id name username profilePicture isVerified')
            .populate({
                path: 'quotedTweet',
                populate: {
                    path: 'author',
                    select: '_id name username profilePicture isVerified'
                }
            });

        return response.status(201).json(populatedTweet);
    } catch (error) {
        console.error('Error in createTweet:', error.message);
        return response.status(500).json({ message: 'Error while creating tweet', error: error.message });
    }
};

// Get tweet by ID
export const getTweetById = async (request, response) => {
    try {
        const { id } = request.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid tweet ID' });
        }
        
        const tweet = await Tweet.findById(id)
            .populate('author', '_id name username profilePicture isVerified')
            .populate({
                path: 'replies',
                populate: {
                    path: 'author',
                    select: '_id name username profilePicture isVerified'
                },
                options: { sort: { createdAt: -1 } }
            })
            .populate({
                path: 'quotedTweet',
                populate: {
                    path: 'author',
                    select: '_id name username profilePicture isVerified'
                }
            });
        
        if (!tweet) {
            return response.status(404).json({ message: 'Tweet not found' });
        }
        
        return response.status(200).json(tweet);
    } catch (error) {
        console.error('Error in getTweetById:', error.message);
        return response.status(500).json({ message: 'Error while getting tweet', error: error.message });
    }
};

// Get timeline tweets (tweets from followed users and own tweets)
export const getTimelineTweets = async (request, response) => {
    try {
        const userId = request.user.id; // From auth middleware
        const { page = 1, limit = 20 } = request.query;
        
        // Get current user to find following
        const currentUser = await User.findById(userId);
        
        if (!currentUser) {
            return response.status(404).json({ message: 'User not found' });
        }
        
        // Get tweets from followed users and own tweets
        const tweets = await Tweet.find({
            $or: [
                { author: { $in: [...currentUser.following, userId] } },
                { mentions: userId }
            ],
            isReply: false // Exclude replies from timeline
        })
            .populate('author', '_id name username profilePicture isVerified')
            .populate({
                path: 'quotedTweet',
                populate: {
                    path: 'author',
                    select: '_id name username profilePicture isVerified'
                }
            })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        // Get total count for pagination
        const totalTweets = await Tweet.countDocuments({
            $or: [
                { author: { $in: [...currentUser.following, userId] } },
                { mentions: userId }
            ],
            isReply: false
        });
        
        return response.status(200).json({
            tweets,
            totalPages: Math.ceil(totalTweets / limit),
            currentPage: parseInt(page),
            totalTweets
        });
    } catch (error) {
        console.error('Error in getTimelineTweets:', error.message);
        return response.status(500).json({ message: 'Error while getting timeline', error: error.message });
    }
};

// Get user tweets
export const getUserTweets = async (request, response) => {
    try {
        const { username } = request.params;
        const { page = 1, limit = 20 } = request.query;
        
        // Find user by username
        const user = await User.findOne({ username });
        
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }
        
        // Get user's tweets (excluding replies)
        const tweets = await Tweet.find({
            author: user._id,
            isReply: false
        })
            .populate('author', '_id name username profilePicture isVerified')
            .populate({
                path: 'quotedTweet',
                populate: {
                    path: 'author',
                    select: '_id name username profilePicture isVerified'
                }
            })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        // Get total count for pagination
        const totalTweets = await Tweet.countDocuments({
            author: user._id,
            isReply: false
        });
        
        return response.status(200).json({
            tweets,
            totalPages: Math.ceil(totalTweets / limit),
            currentPage: parseInt(page),
            totalTweets
        });
    } catch (error) {
        console.error('Error in getUserTweets:', error.message);
        return response.status(500).json({ message: 'Error while getting user tweets', error: error.message });
    }
};

// Like a tweet
export const likeTweet = async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.user.id; // From auth middleware
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid tweet ID' });
        }
        
        // Find tweet
        const tweet = await Tweet.findById(id);
        
        if (!tweet) {
            return response.status(404).json({ message: 'Tweet not found' });
        }
        
        // Check if already liked
        if (tweet.likes.includes(userId)) {
            return response.status(400).json({ message: 'Tweet already liked' });
        }
        
        // Add user to tweet's likes array
        await Tweet.findByIdAndUpdate(id, { $push: { likes: userId } });
        
        // Add tweet to user's likes array
        await User.findByIdAndUpdate(userId, { $push: { likes: id } });
        
        // Create notification (if not liking own tweet)
        if (tweet.author.toString() !== userId) {
            const notification = new Notification({
                recipient: tweet.author,
                sender: userId,
                type: 'like',
                tweet: id
            });
            
            await notification.save();
        }
        
        return response.status(200).json({ message: 'Tweet liked successfully' });
    } catch (error) {
        console.error('Error in likeTweet:', error.message);
        return response.status(500).json({ message: 'Error while liking tweet', error: error.message });
    }
};

// Unlike a tweet
export const unlikeTweet = async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.user.id; // From auth middleware
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid tweet ID' });
        }
        
        // Find tweet
        const tweet = await Tweet.findById(id);
        
        if (!tweet) {
            return response.status(404).json({ message: 'Tweet not found' });
        }
        
        // Check if not liked
        if (!tweet.likes.includes(userId)) {
            return response.status(400).json({ message: 'Tweet not liked yet' });
        }
        
        // Remove user from tweet's likes array
        await Tweet.findByIdAndUpdate(id, { $pull: { likes: userId } });
        
        // Remove tweet from user's likes array
        await User.findByIdAndUpdate(userId, { $pull: { likes: id } });
        
        return response.status(200).json({ message: 'Tweet unliked successfully' });
    } catch (error) {
        console.error('Error in unlikeTweet:', error.message);
        return response.status(500).json({ message: 'Error while unliking tweet', error: error.message });
    }
};

// Retweet a tweet
export const retweetTweet = async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.user.id; // From auth middleware
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid tweet ID' });
        }
        
        // Find tweet
        const originalTweet = await Tweet.findById(id);
        
        if (!originalTweet) {
            return response.status(404).json({ message: 'Tweet not found' });
        }
        
        // Check if already retweeted
        if (originalTweet.retweets.includes(userId)) {
            return response.status(400).json({ message: 'Tweet already retweeted' });
        }
        
        // Create retweet
        const retweet = new Tweet({
            author: userId,
            isRetweet: true,
            originalTweet: id
        });
        
        // Save retweet
        const savedRetweet = await retweet.save();
        
        // Update original tweet's retweets array
        await Tweet.findByIdAndUpdate(id, { $push: { retweets: userId } });
        
        // Update user's tweets and retweets arrays
        await User.findByIdAndUpdate(userId, { 
            $push: { 
                tweets: savedRetweet._id,
                retweets: id 
            } 
        });
        
        // Create notification (if not retweeting own tweet)
        if (originalTweet.author.toString() !== userId) {
            const notification = new Notification({
                recipient: originalTweet.author,
                sender: userId,
                type: 'retweet',
                tweet: id
            });
            
            await notification.save();
        }
        
        return response.status(200).json({ 
            message: 'Tweet retweeted successfully',
            retweetId: savedRetweet._id 
        });
    } catch (error) {
        console.error('Error in retweetTweet:', error.message);
        return response.status(500).json({ message: 'Error while retweeting tweet', error: error.message });
    }
};

// Undo retweet
export const undoRetweet = async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.user.id; // From auth middleware
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid tweet ID' });
        }
        
        // Find tweet
        const originalTweet = await Tweet.findById(id);
        
        if (!originalTweet) {
            return response.status(404).json({ message: 'Tweet not found' });
        }
        
        // Check if not retweeted
        if (!originalTweet.retweets.includes(userId)) {
            return response.status(400).json({ message: 'Tweet not retweeted yet' });
        }
        
        // Find and delete the retweet
        const retweet = await Tweet.findOneAndDelete({
            author: userId,
            isRetweet: true,
            originalTweet: id
        });
        
        if (!retweet) {
            return response.status(404).json({ message: 'Retweet not found' });
        }
        
        // Update original tweet's retweets array
        await Tweet.findByIdAndUpdate(id, { $pull: { retweets: userId } });
        
        // Update user's tweets and retweets arrays
        await User.findByIdAndUpdate(userId, { 
            $pull: { 
                tweets: retweet._id,
                retweets: id 
            } 
        });
        
        return response.status(200).json({ message: 'Retweet removed successfully' });
    } catch (error) {
        console.error('Error in undoRetweet:', error.message);
        return response.status(500).json({ message: 'Error while removing retweet', error: error.message });
    }
};

// Delete a tweet
export const deleteTweet = async (request, response) => {
    try {
        const { id } = request.params;
        const userId = request.user.id; // From auth middleware
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return response.status(400).json({ message: 'Invalid tweet ID' });
        }
        
        // Find tweet
        const tweet = await Tweet.findById(id);
        
        if (!tweet) {
            return response.status(404).json({ message: 'Tweet not found' });
        }
        
        // Check if user is the author
        if (tweet.author.toString() !== userId) {
            return response.status(403).json({ message: 'Not authorized to delete this tweet' });
        }
        
        // Delete tweet
        await Tweet.findByIdAndDelete(id);
        
        // Remove tweet from user's tweets array
        await User.findByIdAndUpdate(userId, { $pull: { tweets: id } });
        
        // If it's a reply, remove from parent tweet's replies array
        if (tweet.isReply && tweet.parentTweet) {
            await Tweet.findByIdAndUpdate(tweet.parentTweet, { $pull: { replies: id } });
        }
        
        // Delete all notifications related to this tweet
        await Notification.deleteMany({ tweet: id });
        
        return response.status(200).json({ message: 'Tweet deleted successfully' });
    } catch (error) {
        console.error('Error in deleteTweet:', error.message);
        return response.status(500).json({ message: 'Error while deleting tweet', error: error.message });
    }
};

// Get tweets by hashtag
export const getTweetsByHashtag = async (request, response) => {
    try {
        const { hashtag } = request.params;
        const { page = 1, limit = 20 } = request.query;
        
        // Find tweets with the hashtag
        const tweets = await Tweet.find({ hashtags: hashtag })
            .populate('author', '_id name username profilePicture isVerified')
            .populate({
                path: 'quotedTweet',
                populate: {
                    path: 'author',
                    select: '_id name username profilePicture isVerified'
                }
            })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        // Get total count for pagination
        const totalTweets = await Tweet.countDocuments({ hashtags: hashtag });
        
        return response.status(200).json({
            tweets,
            totalPages: Math.ceil(totalTweets / limit),
            currentPage: parseInt(page),
            totalTweets,
            hashtag
        });
    } catch (error) {
        console.error('Error in getTweetsByHashtag:', error.message);
        return response.status(500).json({ message: 'Error while getting tweets by hashtag', error: error.message });
    }
};