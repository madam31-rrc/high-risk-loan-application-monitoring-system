export interface LoanApplication {
  id: string;
  applicantName: string;
  amount: number;
  purpose: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface CreateLoanRequest {
  applicantName: string;
  amount: number;
  purpose: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ReviewLoanRequest {
  status: 'under_review' | 'rejected';
  notes?: string;
}

export interface ApproveLoanRequest {
  status: 'approved' | 'rejected';
  notes?: string;
}