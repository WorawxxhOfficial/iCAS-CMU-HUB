import { Response, NextFunction } from 'express';
import pool from '../../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ApiError } from '../../../middleware/errorHandler';
import { AuthRequest } from '../../auth/middleware/authMiddleware';
import { CreateDocumentRequest, UpdateDocumentRequest, Document } from '../types/document';

// Get all documents
export const getDocuments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { type, status, search } = req.query;

    let query = `
      SELECT 
        d.id,
        d.title,
        d.type,
        d.recipient,
        DATE_FORMAT(d.due_date, '%Y-%m-%d') as dueDate,
        d.status,
        d.sent_by as sentBy,
        DATE_FORMAT(d.sent_date, '%Y-%m-%d %H:%i:%s') as sentDate,
        d.notes,
        d.created_by as createdBy,
        DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(d.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(creator.first_name, ' ', creator.last_name) as creatorName,
        creator.email as creatorEmail,
        CONCAT(sender.first_name, ' ', sender.last_name) as senderName,
        sender.email as senderEmail
      FROM documents d
      INNER JOIN users creator ON d.created_by = creator.id
      LEFT JOIN users sender ON d.sent_by = sender.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // If not admin, only show user's own documents
    if (userRole !== 'admin') {
      query += ' AND d.created_by = ?';
      params.push(userId);
    }

    // Filter by type
    if (type && typeof type === 'string') {
      query += ' AND d.type = ?';
      params.push(type);
    }

    // Filter by status
    if (status && typeof status === 'string') {
      query += ' AND d.status = ?';
      params.push(status);
    }

    // Search
    if (search && typeof search === 'string') {
      query += ' AND (d.title LIKE ? OR d.recipient LIKE ? OR d.notes LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    const documents: Document[] = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      recipient: row.recipient,
      dueDate: row.dueDate,
      status: row.status,
      sentBy: row.sentBy || undefined,
      sentDate: row.sentDate || undefined,
      notes: row.notes || undefined,
      createdBy: row.createdBy,
      creator: {
        name: row.creatorName,
        email: row.creatorEmail,
      },
      sender: row.senderName ? {
        name: row.senderName,
        email: row.senderEmail,
      } : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single document
export const getDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const query = `
      SELECT 
        d.id,
        d.title,
        d.type,
        d.recipient,
        DATE_FORMAT(d.due_date, '%Y-%m-%d') as dueDate,
        d.status,
        d.sent_by as sentBy,
        DATE_FORMAT(d.sent_date, '%Y-%m-%d %H:%i:%s') as sentDate,
        d.notes,
        d.created_by as createdBy,
        DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(d.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(creator.first_name, ' ', creator.last_name) as creatorName,
        creator.email as creatorEmail,
        CONCAT(sender.first_name, ' ', sender.last_name) as senderName,
        sender.email as senderEmail
      FROM documents d
      INNER JOIN users creator ON d.created_by = creator.id
      LEFT JOIN users sender ON d.sent_by = sender.id
      WHERE d.id = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [documentId]);

    if (rows.length === 0) {
      const error: ApiError = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user can access this document
    const row = rows[0];
    if (userRole !== 'admin' && row.createdBy !== userId) {
      const error: ApiError = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    const document: Document = {
      id: row.id,
      title: row.title,
      type: row.type,
      recipient: row.recipient,
      dueDate: row.dueDate,
      status: row.status,
      sentBy: row.sentBy || undefined,
      sentDate: row.sentDate || undefined,
      notes: row.notes || undefined,
      createdBy: row.createdBy,
      creator: {
        name: row.creatorName,
        email: row.creatorEmail,
      },
      sender: row.senderName ? {
        name: row.senderName,
        email: row.senderEmail,
      } : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    res.json({
      success: true,
      document,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new document
export const createDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { title, type, recipient, dueDate, notes }: CreateDocumentRequest = req.body;

    if (!title || !type || !recipient || !dueDate) {
      const error: ApiError = new Error('Title, type, recipient, and dueDate are required');
      error.statusCode = 400;
      throw error;
    }

    const query = `
      INSERT INTO documents (title, type, recipient, due_date, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      title,
      type,
      recipient,
      dueDate,
      notes || null,
      userId,
    ]);

    // Fetch created document
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        d.id,
        d.title,
        d.type,
        d.recipient,
        DATE_FORMAT(d.due_date, '%Y-%m-%d') as dueDate,
        d.status,
        d.sent_by as sentBy,
        DATE_FORMAT(d.sent_date, '%Y-%m-%d %H:%i:%s') as sentDate,
        d.notes,
        d.created_by as createdBy,
        DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(d.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(creator.first_name, ' ', creator.last_name) as creatorName,
        creator.email as creatorEmail,
        CONCAT(sender.first_name, ' ', sender.last_name) as senderName,
        sender.email as senderEmail
      FROM documents d
      INNER JOIN users creator ON d.created_by = creator.id
      LEFT JOIN users sender ON d.sent_by = sender.id
      WHERE d.id = ?`,
      [result.insertId]
    );

    const row = rows[0];
    const document: Document = {
      id: row.id,
      title: row.title,
      type: row.type,
      recipient: row.recipient,
      dueDate: row.dueDate,
      status: row.status,
      sentBy: row.sentBy || undefined,
      sentDate: row.sentDate || undefined,
      notes: row.notes || undefined,
      createdBy: row.createdBy,
      creator: {
        name: row.creatorName,
        email: row.creatorEmail,
      },
      sender: row.senderName ? {
        name: row.senderName,
        email: row.senderEmail,
      } : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: 'Document created successfully',
      document,
    });
  } catch (error) {
    next(error);
  }
};

// Update a document
export const updateDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { title, type, recipient, dueDate, status, notes }: UpdateDocumentRequest = req.body;

    // Check if document exists and user has permission
    const [checkRows] = await pool.execute<RowDataPacket[]>(
      'SELECT created_by FROM documents WHERE id = ?',
      [documentId]
    );

    if (checkRows.length === 0) {
      const error: ApiError = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'admin' && checkRows[0].created_by !== userId) {
      const error: ApiError = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (recipient !== undefined) {
      updates.push('recipient = ?');
      params.push(recipient);
    }
    if (dueDate !== undefined) {
      updates.push('due_date = ?');
      params.push(dueDate);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      const error: ApiError = new Error('No fields to update');
      error.statusCode = 400;
      throw error;
    }

    params.push(documentId);

    const query = `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`;
    await pool.execute(query, params);

    // Fetch updated document
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        d.id,
        d.title,
        d.type,
        d.recipient,
        DATE_FORMAT(d.due_date, '%Y-%m-%d') as dueDate,
        d.status,
        d.sent_by as sentBy,
        DATE_FORMAT(d.sent_date, '%Y-%m-%d %H:%i:%s') as sentDate,
        d.notes,
        d.created_by as createdBy,
        DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(d.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(creator.first_name, ' ', creator.last_name) as creatorName,
        creator.email as creatorEmail,
        CONCAT(sender.first_name, ' ', sender.last_name) as senderName,
        sender.email as senderEmail
      FROM documents d
      INNER JOIN users creator ON d.created_by = creator.id
      LEFT JOIN users sender ON d.sent_by = sender.id
      WHERE d.id = ?`,
      [documentId]
    );

    const row = rows[0];
    const document: Document = {
      id: row.id,
      title: row.title,
      type: row.type,
      recipient: row.recipient,
      dueDate: row.dueDate,
      status: row.status,
      sentBy: row.sentBy || undefined,
      sentDate: row.sentDate || undefined,
      notes: row.notes || undefined,
      createdBy: row.createdBy,
      creator: {
        name: row.creatorName,
        email: row.creatorEmail,
      },
      sender: row.senderName ? {
        name: row.senderName,
        email: row.senderEmail,
      } : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    res.json({
      success: true,
      message: 'Document updated successfully',
      document,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a document
export const deleteDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check if document exists and user has permission
    const [checkRows] = await pool.execute<RowDataPacket[]>(
      'SELECT created_by FROM documents WHERE id = ?',
      [documentId]
    );

    if (checkRows.length === 0) {
      const error: ApiError = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'admin' && checkRows[0].created_by !== userId) {
      const error: ApiError = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    await pool.execute('DELETE FROM documents WHERE id = ?', [documentId]);

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Send a document
export const sendDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check if document exists and user has permission
    const [checkRows] = await pool.execute<RowDataPacket[]>(
      'SELECT created_by FROM documents WHERE id = ?',
      [documentId]
    );

    if (checkRows.length === 0) {
      const error: ApiError = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'admin' && checkRows[0].created_by !== userId) {
      const error: ApiError = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    // Update document status to Sent
    await pool.execute(
      'UPDATE documents SET status = ?, sent_by = ?, sent_date = NOW() WHERE id = ?',
      ['Sent', userId, documentId]
    );

    // Fetch updated document
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        d.id,
        d.title,
        d.type,
        d.recipient,
        DATE_FORMAT(d.due_date, '%Y-%m-%d') as dueDate,
        d.status,
        d.sent_by as sentBy,
        DATE_FORMAT(d.sent_date, '%Y-%m-%d %H:%i:%s') as sentDate,
        d.notes,
        d.created_by as createdBy,
        DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(d.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(creator.first_name, ' ', creator.last_name) as creatorName,
        creator.email as creatorEmail,
        CONCAT(sender.first_name, ' ', sender.last_name) as senderName,
        sender.email as senderEmail
      FROM documents d
      INNER JOIN users creator ON d.created_by = creator.id
      LEFT JOIN users sender ON d.sent_by = sender.id
      WHERE d.id = ?`,
      [documentId]
    );

    const row = rows[0];
    const document: Document = {
      id: row.id,
      title: row.title,
      type: row.type,
      recipient: row.recipient,
      dueDate: row.dueDate,
      status: row.status,
      sentBy: row.sentBy || undefined,
      sentDate: row.sentDate || undefined,
      notes: row.notes || undefined,
      createdBy: row.createdBy,
      creator: {
        name: row.creatorName,
        email: row.creatorEmail,
      },
      sender: row.senderName ? {
        name: row.senderName,
        email: row.senderEmail,
      } : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    res.json({
      success: true,
      message: 'Document sent successfully',
      document,
    });
  } catch (error) {
    next(error);
  }
};

