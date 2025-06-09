import express from 'express';
import { getImage, deleteImage } from '../controllers/image-controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public route for getting images
router.get('/:filename', getImage);

// Protected route for deleting images
router.delete('/:filename', authenticateToken, deleteImage);

export default router;