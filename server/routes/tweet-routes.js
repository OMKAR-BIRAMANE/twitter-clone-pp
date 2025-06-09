import express from 'express';
import { 
    createTweet, 
    getTweetById, 
    getTimelineTweets, 
    getUserTweets, 
    likeTweet, 
    unlikeTweet, 
    retweetTweet, 
    undoRetweet, 
    deleteTweet,
    getTweetsByHashtag
} from '../controllers/tweet-controller.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// Public tweet routes
router.get('/:id', getTweetById);
router.get('/user/:username', getUserTweets);
router.get('/hashtag/:hashtag', getTweetsByHashtag);

// Protected tweet routes (require authentication)
router.post('/', authenticateToken, upload.array('media', 4), createTweet);
router.get('/timeline', authenticateToken, getTimelineTweets);
router.post('/:id/like', authenticateToken, likeTweet);
router.post('/:id/unlike', authenticateToken, unlikeTweet);
router.post('/:id/retweet', authenticateToken, retweetTweet);
router.post('/:id/unretweet', authenticateToken, undoRetweet);
router.delete('/:id', authenticateToken, deleteTweet);

export default router;