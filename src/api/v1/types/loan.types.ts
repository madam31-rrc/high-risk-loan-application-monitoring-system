export interface Loan {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  comments?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'officer' | 'manager';
}