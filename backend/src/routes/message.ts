import { Router } from 'express';
import { sendMessage, getMessageHistory } from '../controllers/message';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../middlewares/asyncHandler'; // Assuming you have this wrapper

const router = Router();

/**
 * @route   POST /api/messages/send
 * @desc    Send a private message
 * @access  Private (Requires authentication)
 */
router.post('/send', authenticate, asyncHandler(sendMessage));

/**
 * @route   GET /api/messages/history
 * @desc    Get message history with another user
 * @access  Private (Requires authentication)
 */
// Note: Needs query parameter for the other user's ID
router.get('/history', authenticate, asyncHandler(getMessageHistory)); 

export default router;

export {}; // Ensure this file is treated as a module