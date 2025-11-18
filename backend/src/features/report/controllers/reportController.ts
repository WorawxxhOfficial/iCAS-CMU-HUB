import { Response, NextFunction } from 'express';
import pool from '../../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ApiError } from '../../../middleware/errorHandler';
import { AuthRequest } from '../../auth/middleware/authMiddleware';
import { CreateReportRequest, UpdateReportStatusRequest, UpdateReportResponseRequest, Report, ReportStats } from '../types/report';

// Get all reports (admin only, or user's own reports)
export const getReports = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { type, status } = req.query;

    let query = `
      SELECT 
        r.id,
        r.type,
        r.subject,
        r.message,
        r.sender_id as senderId,
        r.status,
        r.assigned_to as assignedTo,
        r.response,
        DATE_FORMAT(r.response_date, '%Y-%m-%d %H:%i:%s') as responseDate,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(u.first_name, ' ', u.last_name) as senderName,
        u.email as senderEmail,
        c.name as senderClubName
      FROM reports r
      INNER JOIN users u ON r.sender_id = u.id
      LEFT JOIN club_memberships cm ON u.id = cm.user_id AND cm.status = 'approved'
      LEFT JOIN clubs c ON cm.club_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];

    // If not admin, only show user's own reports
    if (userRole !== 'admin') {
      query += ' AND r.sender_id = ?';
      params.push(userId);
    }

    // Filter by type
    if (type && typeof type === 'string') {
      query += ' AND r.type = ?';
      params.push(type);
    }

    // Filter by status
    if (status && typeof status === 'string') {
      query += ' AND r.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    const reports: Report[] = rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      subject: row.subject,
      message: row.message,
      senderId: row.senderId,
      sender: {
        name: row.senderName,
        email: row.senderEmail,
        club: row.senderClubName || undefined,
      },
      status: row.status,
      assignedTo: row.assignedTo || undefined,
      response: row.response || undefined,
      responseDate: row.responseDate || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single report
export const getReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const reportId = parseInt(req.params.id);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const query = `
      SELECT 
        r.id,
        r.type,
        r.subject,
        r.message,
        r.sender_id as senderId,
        r.status,
        r.assigned_to as assignedTo,
        r.response,
        DATE_FORMAT(r.response_date, '%Y-%m-%d %H:%i:%s') as responseDate,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(u.first_name, ' ', u.last_name) as senderName,
        u.email as senderEmail,
        c.name as senderClubName
      FROM reports r
      INNER JOIN users u ON r.sender_id = u.id
      LEFT JOIN club_memberships cm ON u.id = cm.user_id AND cm.status = 'approved'
      LEFT JOIN clubs c ON cm.club_id = c.id
      WHERE r.id = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [reportId]);

    if (rows.length === 0) {
      const error: ApiError = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user can access this report
    const row = rows[0];
    if (userRole !== 'admin' && row.senderId !== userId) {
      const error: ApiError = new Error('Unauthorized');
      error.statusCode = 403;
      throw error;
    }

    const report: Report = {
      id: row.id,
      type: row.type,
      subject: row.subject,
      message: row.message,
      senderId: row.senderId,
      sender: {
        name: row.senderName,
        email: row.senderEmail,
        club: row.senderClubName || undefined,
      },
      status: row.status,
      assignedTo: row.assignedTo || undefined,
      response: row.response || undefined,
      responseDate: row.responseDate || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new report
export const createReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { type, subject, message }: CreateReportRequest = req.body;

    if (!type || !subject || !message) {
      const error: ApiError = new Error('Type, subject, and message are required');
      error.statusCode = 400;
      throw error;
    }

    const query = `
      INSERT INTO reports (type, subject, message, sender_id)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      type,
      subject,
      message,
      userId,
    ]);

    // Fetch created report
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        r.id,
        r.type,
        r.subject,
        r.message,
        r.sender_id as senderId,
        r.status,
        r.assigned_to as assignedTo,
        r.response,
        DATE_FORMAT(r.response_date, '%Y-%m-%d %H:%i:%s') as responseDate,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(u.first_name, ' ', u.last_name) as senderName,
        u.email as senderEmail,
        c.name as senderClubName
      FROM reports r
      INNER JOIN users u ON r.sender_id = u.id
      LEFT JOIN club_memberships cm ON u.id = cm.user_id AND cm.status = 'approved'
      LEFT JOIN clubs c ON cm.club_id = c.id
      WHERE r.id = ?`,
      [result.insertId]
    );

    const row = rows[0];
    const report: Report = {
      id: row.id,
      type: row.type,
      subject: row.subject,
      message: row.message,
      senderId: row.senderId,
      sender: {
        name: row.senderName,
        email: row.senderEmail,
        club: row.senderClubName || undefined,
      },
      status: row.status,
      assignedTo: row.assignedTo || undefined,
      response: row.response || undefined,
      responseDate: row.responseDate || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// Update report status (admin only)
export const updateReportStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const reportId = parseInt(req.params.id);
    const userRole = req.user?.role;
    const { status, assignedTo }: UpdateReportStatusRequest = req.body;

    if (userRole !== 'admin') {
      const error: ApiError = new Error('Unauthorized - Admin only');
      error.statusCode = 403;
      throw error;
    }

    if (!status) {
      const error: ApiError = new Error('Status is required');
      error.statusCode = 400;
      throw error;
    }

    const query = `
      UPDATE reports
      SET status = ?, assigned_to = ?
      WHERE id = ?
    `;

    await pool.execute(query, [status, assignedTo || null, reportId]);

    // Fetch updated report
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        r.id,
        r.type,
        r.subject,
        r.message,
        r.sender_id as senderId,
        r.status,
        r.assigned_to as assignedTo,
        r.response,
        DATE_FORMAT(r.response_date, '%Y-%m-%d %H:%i:%s') as responseDate,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(u.first_name, ' ', u.last_name) as senderName,
        u.email as senderEmail,
        c.name as senderClubName
      FROM reports r
      INNER JOIN users u ON r.sender_id = u.id
      LEFT JOIN club_memberships cm ON u.id = cm.user_id AND cm.status = 'approved'
      LEFT JOIN clubs c ON cm.club_id = c.id
      WHERE r.id = ?`,
      [reportId]
    );

    if (rows.length === 0) {
      const error: ApiError = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    const row = rows[0];
    const report: Report = {
      id: row.id,
      type: row.type,
      subject: row.subject,
      message: row.message,
      senderId: row.senderId,
      sender: {
        name: row.senderName,
        email: row.senderEmail,
        club: row.senderClubName || undefined,
      },
      status: row.status,
      assignedTo: row.assignedTo || undefined,
      response: row.response || undefined,
      responseDate: row.responseDate || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    res.json({
      success: true,
      message: 'Report status updated successfully',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// Update report response (admin only)
export const updateReportResponse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const reportId = parseInt(req.params.id);
    const userRole = req.user?.role;
    const { response }: UpdateReportResponseRequest = req.body;

    if (userRole !== 'admin') {
      const error: ApiError = new Error('Unauthorized - Admin only');
      error.statusCode = 403;
      throw error;
    }

    if (!response) {
      const error: ApiError = new Error('Response is required');
      error.statusCode = 400;
      throw error;
    }

    const query = `
      UPDATE reports
      SET response = ?, response_date = NOW(), status = 'resolved'
      WHERE id = ?
    `;

    await pool.execute(query, [response, reportId]);

    // Fetch updated report
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        r.id,
        r.type,
        r.subject,
        r.message,
        r.sender_id as senderId,
        r.status,
        r.assigned_to as assignedTo,
        r.response,
        DATE_FORMAT(r.response_date, '%Y-%m-%d %H:%i:%s') as responseDate,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(u.first_name, ' ', u.last_name) as senderName,
        u.email as senderEmail,
        c.name as senderClubName
      FROM reports r
      INNER JOIN users u ON r.sender_id = u.id
      LEFT JOIN club_memberships cm ON u.id = cm.user_id AND cm.status = 'approved'
      LEFT JOIN clubs c ON cm.club_id = c.id
      WHERE r.id = ?`,
      [reportId]
    );

    if (rows.length === 0) {
      const error: ApiError = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    const row = rows[0];
    const report: Report = {
      id: row.id,
      type: row.type,
      subject: row.subject,
      message: row.message,
      senderId: row.senderId,
      sender: {
        name: row.senderName,
        email: row.senderEmail,
        club: row.senderClubName || undefined,
      },
      status: row.status,
      assignedTo: row.assignedTo || undefined,
      response: row.response || undefined,
      responseDate: row.responseDate || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    res.json({
      success: true,
      message: 'Report response updated successfully',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// Get report statistics (admin only)
export const getReportStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      const error: ApiError = new Error('Unauthorized - Admin only');
      error.statusCode = 403;
      throw error;
    }

    // Get total count
    const [totalRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM reports'
    );
    const total = totalRows[0].total;

    // Get count by type
    const [typeRows] = await pool.execute<RowDataPacket[]>(
      `SELECT type, COUNT(*) as count 
       FROM reports 
       GROUP BY type`
    );
    const byType: Record<string, number> = {};
    typeRows.forEach((row: any) => {
      byType[row.type] = row.count;
    });

    // Get count by status
    const [statusRows] = await pool.execute<RowDataPacket[]>(
      `SELECT status, COUNT(*) as count 
       FROM reports 
       GROUP BY status`
    );
    const byStatus: Record<string, number> = {};
    statusRows.forEach((row: any) => {
      byStatus[row.status] = row.count;
    });

    // Get recent reports
    const [recentRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        r.id,
        r.type,
        r.subject,
        r.message,
        r.sender_id as senderId,
        r.status,
        r.assigned_to as assignedTo,
        r.response,
        DATE_FORMAT(r.response_date, '%Y-%m-%d %H:%i:%s') as responseDate,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt,
        CONCAT(u.first_name, ' ', u.last_name) as senderName,
        u.email as senderEmail,
        c.name as senderClubName
      FROM reports r
      INNER JOIN users u ON r.sender_id = u.id
      LEFT JOIN club_memberships cm ON u.id = cm.user_id AND cm.status = 'approved'
      LEFT JOIN clubs c ON cm.club_id = c.id
      ORDER BY r.created_at DESC
      LIMIT 10`
    );

    const recentReports: Report[] = recentRows.map((row: any) => ({
      id: row.id,
      type: row.type,
      subject: row.subject,
      message: row.message,
      senderId: row.senderId,
      sender: {
        name: row.senderName,
        email: row.senderEmail,
        club: row.senderClubName || undefined,
      },
      status: row.status,
      assignedTo: row.assignedTo || undefined,
      response: row.response || undefined,
      responseDate: row.responseDate || undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    const stats: ReportStats = {
      total,
      byType: byType as any,
      byStatus: byStatus as any,
      recentReports,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

