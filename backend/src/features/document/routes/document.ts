import { Router } from 'express';
import { authenticate } from '../../auth/middleware/authMiddleware';
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  sendDocument,
} from '../controllers/documentController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all documents
router.get('/', getDocuments);

// Get a single document
router.get('/:id', getDocument);

// Create a new document
router.post('/', createDocument);

// Update a document
router.put('/:id', updateDocument);

// Delete a document
router.delete('/:id', deleteDocument);

// Send a document
router.post('/:id/send', sendDocument);

export default router;

