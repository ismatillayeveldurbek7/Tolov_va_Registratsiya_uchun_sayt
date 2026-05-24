export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  receiptName: string;
  receiptType: string; // e.g., 'image/png', 'application/pdf'
  receiptData: string; // Base64 url
  createdAt: string;
  status: 'Kutilmoqda' | 'Qabul qilindi' | 'Rad etildi';
  rejectionReason?: string;
}

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export type Theme = 'light' | 'dark';
