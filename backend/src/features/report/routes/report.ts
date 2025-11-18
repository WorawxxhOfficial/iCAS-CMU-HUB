import { Router } from 'express';
import { authenticate } from '../../auth/middleware/authMiddleware';
import {
  getReports,
  getReport,
  createReport,
  updateReportStatus,
  updateReportResponse,
  getReportStats,
} from '../controllers/reportController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all reports (admin sees all, users see their own)
router.get('/', getReports);

// Get report statistics (admin only)
router.get('/stats', getReportStats);

// Get a single report
router.get('/:id', getReport);

// Create a new report
router.post('/', createReport);

// Update report status (admin only)
router.patch('/:id/status', updateReportStatus);

// Update report response (admin only)
router.patch('/:id/response', updateReportResponse);

export default router;

