export type DocumentType = 'Report' | 'Form' | 'Application' | 'Contract' | 'Letter' | 'Other';
export type DocumentStatus = 'Draft' | 'Sent' | 'Delivered' | 'Read' | 'Needs Revision';

export interface Document {
  id: number;
  title: string;
  type: DocumentType;
  recipient: string;
  dueDate: string;
  status: DocumentStatus;
  sentBy?: number;
  sentDate?: string;
  notes?: string;
  createdBy: number;
  creator?: {
    name: string;
    email: string;
  };
  sender?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title: string;
  type: DocumentType;
  recipient: string;
  dueDate: string;
  notes?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  type?: DocumentType;
  recipient?: string;
  dueDate?: string;
  status?: DocumentStatus;
  notes?: string;
}

