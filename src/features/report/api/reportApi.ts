import api from '../../../config/api';
import type { Report, CreateReportRequest, UpdateReportStatusRequest, UpdateReportResponseRequest, ReportStats } from '../types/report';

export const reportApi = {
  // Get all reports
  getReports: async (filters?: { type?: string; status?: string }): Promise<Report[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const url = queryString ? `/reports?${queryString}` : '/reports';
    const response = await api.get<{ success: boolean; reports: Report[] }>(url);
    return response.data.reports;
  },

  // Get a single report
  getReport: async (id: number): Promise<Report> => {
    const response = await api.get<{ success: boolean; report: Report }>(`/reports/${id}`);
    return response.data.report;
  },

  // Create a new report
  createReport: async (data: CreateReportRequest): Promise<Report> => {
    const response = await api.post<{ success: boolean; message: string; report: Report }>('/reports', data);
    return response.data.report;
  },

  // Update report status (admin only)
  updateReportStatus: async (id: number, data: UpdateReportStatusRequest): Promise<Report> => {
    const response = await api.patch<{ success: boolean; message: string; report: Report }>(`/reports/${id}/status`, data);
    return response.data.report;
  },

  // Update report response (admin only)
  updateReportResponse: async (id: number, data: UpdateReportResponseRequest): Promise<Report> => {
    const response = await api.patch<{ success: boolean; message: string; report: Report }>(`/reports/${id}/response`, data);
    return response.data.report;
  },

  // Get report statistics (admin only)
  getReportStats: async (): Promise<ReportStats> => {
    const response = await api.get<{ success: boolean; stats: ReportStats }>('/reports/stats');
    return response.data.stats;
  },
};

