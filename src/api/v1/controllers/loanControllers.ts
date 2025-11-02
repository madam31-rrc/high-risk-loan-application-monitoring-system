import { Request, Response } from 'express';
import { Loan } from '../types/loan.types';

let loans: Loan[] = [];

export const loanController = {
  createLoan: async (req: Request, res: Response) => {
    try {
      const { amount, purpose, userId } = req.body;

      if (!amount || !purpose) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['amount', 'purpose']
        });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }

      const newLoan: Loan = {
        id: "loan_" + (loans.length + 1),
        userId: userId,
        amount,
        purpose,
        status: 'pending',
        createdAt: new Date()
      };

      loans.push(newLoan);

      return res.status(201).json({
        message: 'Loan application created successfully',
        loan: newLoan
      });
    } catch (error) {
      console.error('Error creating loan:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  getLoans: async (req: Request, res: Response) => {
    try {
      const { status, userId } = req.query;

      let filteredLoans = [...loans];

      if (status && typeof status === 'string') {
        filteredLoans = filteredLoans.filter(loan => loan.status === status);
      }

      if (userId && typeof userId === 'string') {
        filteredLoans = filteredLoans.filter(loan => loan.userId === userId);
      }

      return res.status(200).json({
        count: filteredLoans.length,
        loans: filteredLoans
      });
    } catch (error) {
      console.error('Error fetching loans:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  reviewLoan: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, comments, userId } = req.body;

      // Validation
      if (!status || !['reviewed', 'rejected'].includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status',
          allowed: ['reviewed', 'rejected']
        });
      }

      const loanIndex = loans.findIndex(loan => loan.id === id);

      if (loanIndex === -1) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      const loan = loans[loanIndex];

      if (loan.status !== 'pending') {
        return res.status(400).json({ 
          error: 'Loan cannot be reviewed',
          message: `Loan is already ${loan.status}`
        });
      }

      // Update loan
      loans[loanIndex] = {
        ...loan,
        status: status as 'reviewed' | 'rejected',
        reviewedAt: new Date(),
        reviewedBy: userId,
        ...(comments && { comments })
      };

      return res.status(200).json({
        message: 'Loan reviewed successfully',
        loan: loans[loanIndex]
      });
    } catch (error) {
      console.error('Error reviewing loan:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  approveLoan: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { comments, userId } = req.body;

      const loanIndex = loans.findIndex(loan => loan.id === id);

      if (loanIndex === -1) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      const loan = loans[loanIndex];

      if (loan.status !== 'reviewed') {
        return res.status(400).json({ 
          error: 'Loan cannot be approved',
          message: `Loan must be reviewed first. Current status: ${loan.status}`
        });
      }

      // Update loan
      loans[loanIndex] = {
        ...loan,
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: userId,
        ...(comments && { comments })
      };

      return res.status(200).json({
        message: 'Loan approved successfully',
        loan: loans[loanIndex]
      });
    } catch (error) {
      console.error('Error approving loan:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};
