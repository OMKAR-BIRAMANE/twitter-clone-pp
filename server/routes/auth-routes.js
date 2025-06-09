import express from 'express';
import { signupUser, loginUser, logoutUser } from '../controllers/auth-controller.js';
import { refreshAccessToken } from '../middleware/auth.js';

const router = express.Router();

// User signup
router.post('/signup', signupUser);

// User login
router.post('/login', loginUser);

// Refresh token
router.post('/refresh-token', refreshAccessToken);

// User logout
router.post('/logout', logoutUser);

export default router;