import express from 'express';
import { 
    getUserByUsername as getUserProfile, 
    getUserById, 
    getAllUsers, 
    followUser, 
    unfollowUser, 
    updateUserProfile,
    getUserFollowers,
    getUserFollowing
} from '../controllers/user-controller.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// User routes
router.get('/profile/:username', getUserProfile);
router.get('/:id', getUserById);
router.get('/', getAllUsers);

// Protected routes (require authentication)
router.post('/follow/:id', authenticateToken, followUser);
router.post('/unfollow/:id', authenticateToken, unfollowUser);
router.put('/update', authenticateToken, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPicture', maxCount: 1 }
]), updateUserProfile);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);

export default router;