import api from '../../../config/api';
import type { Document, CreateDocumentRequest, UpdateDocumentRequest } from '../types/document';

export const documentApi = {
  // Get all documents
  getDocuments: async (filters?: { type?: string; status?: string; search?: string }): Promise<Document[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = queryString ? `/documents?${queryString}` : '/documents';
    const response = await api.get<{ success: boolean; documents: Document[] }>(url);
    return response.data.documents;
  },

  // Get a single document
  getDocument: async (id: number): Promise<Document> => {
    const response = await api.get<{ success: boolean; document: Document }>(`/documents/${id}`);
    return response.data.document;
  },

  // Create a new document
  createDocument: async (data: CreateDocumentRequest): Promise<Document> => {
    const response = await api.post<{ success: boolean; message: string; document: Document }>('/documents', data);
    return response.data.document;
  },

  // Update a document
  updateDocument: async (id: number, data: UpdateDocumentRequest): Promise<Document> => {
    const response = await api.put<{ success: boolean; message: string; document: Document }>(`/documents/${id}`, data);
    return response.data.document;
  },

  // Delete a document
  deleteDocument: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean; message: string }>(`/documents/${id}`);
  },

  // Send a document
  sendDocument: async (id: number): Promise<Document> => {
    const response = await api.post<{ success: boolean; message: string; document: Document }>(`/documents/${id}/send`);
    return response.data.document;
  },
};

