import express from 'express';
import multer from 'multer';
import * as adminController from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.post('/login', adminController.login);

// Protected routes - require authentication
router.get('/models', authenticateAdmin, adminController.getAllModels);
router.get('/models/:id', authenticateAdmin, adminController.getModelById);
router.post('/models', authenticateAdmin, upload.single('image'), adminController.createModel);
router.put('/models/:id', authenticateAdmin, upload.single('image'), adminController.updateModel);
router.delete('/models/:id', authenticateAdmin, adminController.deleteModel);

router.get('/votes', authenticateAdmin, adminController.getAllVotes);
router.delete('/votes/:id', authenticateAdmin, adminController.deleteVote);

router.get('/settings', authenticateAdmin, adminController.getSettings);
router.put('/settings', authenticateAdmin, adminController.updateSettings);

export default router;