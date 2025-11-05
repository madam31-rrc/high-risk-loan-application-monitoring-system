import request from 'supertest';
import express, { Express } from 'express';
import loanRoutes from "../src/api/v1/routes/loanRoutes";
import { loanController } from "../src/api/v1/controllers/loanControllers";

jest.mock('../middleware/authenticate', () => {
  return jest.fn((req, res, next) => {
    req.user = { id: 'user123', role: 'user' };
    next();
  });
});

jest.mock('../middleware/authorize', () => {
  return jest.fn(() => (req: any, res: any, next: () => void) => {
    next();
  });
});

describe('Loan Controller Tests', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/loans', loanRoutes);
    

    (loanController as any).loans = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/loans - Create Loan', () => {
    it('should create a new loan successfully', async () => {
      const loanData = {
        amount: 5000,
        purpose: 'Home renovation',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/loans')
        .send(loanData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Loan application created successfully');
      expect(response.body.loan).toMatchObject({
        id: expect.stringContaining('loan_'),
        userId: 'user123',
        amount: 5000,
        purpose: 'Home renovation',
        status: 'pending'
      });
      expect(response.body.loan).toHaveProperty('createdAt');
    });

    it('should return 400 if amount is missing', async () => {
      const loanData = {
        purpose: 'Home renovation',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/loans')
        .send(loanData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Missing required fields');
      expect(response.body.required).toContain('amount');
    });

    it('should return 400 if purpose is missing', async () => {
      const loanData = {
        amount: 5000,
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/loans')
        .send(loanData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Missing required fields');
      expect(response.body.required).toContain('purpose');
    });

    it('should return 400 if amount is not a positive number', async () => {
      const loanData = {
        amount: -5000,
        purpose: 'Home renovation',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/loans')
        .send(loanData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Amount must be a positive number');
    });

    it('should return 400 if amount is zero', async () => {
      const loanData = {
        amount: 0,
        purpose: 'Home renovation',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/loans')
        .send(loanData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Amount must be a positive number');
    });

    it('should return 400 if amount is not a number', async () => {
      const loanData = {
        amount: '5000',
        purpose: 'Home renovation',
        userId: 'user123'
      };

      const response = await request(app)
        .post('/api/loans')
        .send(loanData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Amount must be a positive number');
    });
  });

  describe('GET /api/loans - Get Loans', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/loans')
        .send({ amount: 5000, purpose: 'Car', userId: 'user1' });
      
      await request(app)
        .post('/api/loans')
        .send({ amount: 10000, purpose: 'House', userId: 'user2' });
      
      await request(app)
        .post('/api/loans')
        .send({ amount: 3000, purpose: 'Education', userId: 'user1' });
    });

    it('should return all loans', async () => {
      const response = await request(app)
        .get('/api/loans')
        .expect(200);

      expect(response.body.count).toBe(3);
      expect(response.body.loans).toHaveLength(3);
    });

    it('should filter loans by status', async () => {
      const response = await request(app)
        .get('/api/loans?status=pending')
        .expect(200);

      expect(response.body.loans).toHaveLength(3);
      expect(response.body.loans.every((loan: { status: string; }) => loan.status === 'pending')).toBe(true);
    });

    it('should filter loans by userId', async () => {
      const response = await request(app)
        .get('/api/loans?userId=user1')
        .expect(200);

      expect(response.body.count).toBe(2);
      expect(response.body.loans.every((loan: { userId: string; }) => loan.userId === 'user1')).toBe(true);
    });

    it('should filter loans by both status and userId', async () => {
      const response = await request(app)
        .get('/api/loans?status=pending&userId=user1')
        .expect(200);

      expect(response.body.count).toBe(2);
      expect(response.body.loans.every((loan: { status: string; userId: string; }) => 
        loan.status === 'pending' && loan.userId === 'user1'
      )).toBe(true);
    });

    it('should return empty array when no loans match filter', async () => {
      const response = await request(app)
        .get('/api/loans?userId=nonexistent')
        .expect(200);

      expect(response.body.count).toBe(0);
      expect(response.body.loans).toHaveLength(0);
    });
  });

  describe('PUT /api/loans/:id/review - Review Loan', () => {
    let loanId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/loans')
        .send({ amount: 5000, purpose: 'Car', userId: 'user1' });
      
      loanId = createResponse.body.loan.id;
    });

    it('should review a loan successfully', async () => {
      const response = await request(app)
        .put(`/api/loans/${loanId}/review`)
        .send({
          status: 'reviewed',
          comments: 'All documents verified',
          userId: 'officer1'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Loan application reviewed successfully');
      expect(response.body.loan).toMatchObject({
        id: loanId,
        status: 'reviewed',
        reviewedBy: 'officer1',
        comments: 'All documents verified'
      });
      expect(response.body.loan).toHaveProperty('reviewedAt');
    });

    it('should reject a loan successfully', async () => {
      const response = await request(app)
        .put(`/api/loans/${loanId}/review`)
        .send({
          status: 'rejected',
          comments: 'Insufficient documentation',
          userId: 'officer1'
        })
        .expect(200);

      expect(response.body.loan.status).toBe('rejected');
      expect(response.body.loan.comments).toBe('Insufficient documentation');
    });

    it('should return 400 if status is missing', async () => {
      const response = await request(app)
        .put(`/api/loans/${loanId}/review`)
        .send({
          comments: 'Test',
          userId: 'officer1'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid status');
    });

    it('should return 400 if status is invalid', async () => {
      const response = await request(app)
        .put(`/api/loans/${loanId}/review`)
        .send({
          status: 'approved',
          userId: 'officer1'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid status');
      expect(response.body.allowed).toEqual(['reviewed', 'rejected']);
    });

    it('should return 404 if loan not found', async () => {
      const response = await request(app)
        .put('/api/loans/nonexistent_id/review')
        .send({
          status: 'reviewed',
          userId: 'officer1'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Loan application not found');
    });

    it('should return 400 if loan is already reviewed', async () => {
      await request(app)
        .put(`/api/loans/${loanId}/review`)
        .send({
          status: 'reviewed',
          userId: 'officer1'
        });

      const response = await request(app)
        .put(`/api/loans/${loanId}/review`)
        .send({
          status: 'reviewed',
          userId: 'officer1'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Loan cannot be reviewed');
      expect(response.body.message).toContain('already reviewed');
    });

    it('should work without comments', async () => {
      const response = await request(app)
        .put(`/api/loans/${loanId}/review`)
        .send({
          status: 'reviewed',
          userId: 'officer1'
        })
        .expect(200);

      expect(response.body.loan.status).toBe('reviewed');
      expect(response.body.loan).not.toHaveProperty('comments');
    });
  });

  describe('PUT /api/loans/:id/approve - Approve Loan', () => {
    let loanId: string;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/loans')
        .send({ amount: 5000, purpose: 'Car', userId: 'user1' });
      
      loanId = createResponse.body.loan.id;

      await request(app)
        .put(`/api/loans/${loanId}/review`)
        .send({
          status: 'reviewed',
          userId: 'officer1'
        });
    });

    it('should approve a reviewed loan successfully', async () => {
      const response = await request(app)
        .put(`/api/loans/${loanId}/approve`)
        .send({
          comments: 'Approved for disbursement',
          userId: 'manager1'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Loan approved successfully');
      expect(response.body.loan).toMatchObject({
        id: loanId,
        status: 'approved',
        approvedBy: 'manager1',
        comments: 'Approved for disbursement'
      });
      expect(response.body.loan).toHaveProperty('approvedAt');
    });

    it('should return 404 if loan not found', async () => {
      const response = await request(app)
        .put('/api/loans/nonexistent_id/approve')
        .send({
          userId: 'manager1'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Loan not found');
    });

    it('should return 400 if loan is not reviewed', async () => {
      const newLoanResponse = await request(app)
        .post('/api/loans')
        .send({ amount: 3000, purpose: 'Education', userId: 'user2' });
      
      const newLoanId = newLoanResponse.body.loan.id;

      const response = await request(app)
        .put(`/api/loans/${newLoanId}/approve`)
        .send({
          userId: 'manager1'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Loan cannot be approved');
      expect(response.body.message).toContain('must be reviewed first');
    });

    it('should return 400 if trying to approve a rejected loan', async () => {
      const rejectedLoanResponse = await request(app)
        .post('/api/loans')
        .send({ amount: 2000, purpose: 'Travel', userId: 'user3' });
      
      const rejectedLoanId = rejectedLoanResponse.body.loan.id;

      await request(app)
        .put(`/api/loans/${rejectedLoanId}/review`)
        .send({
          status: 'rejected',
          userId: 'officer1'
        });

      const response = await request(app)
        .put(`/api/loans/${rejectedLoanId}/approve`)
        .send({
          userId: 'manager1'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Loan cannot be approved');
    });

    it('should work without comments', async () => {
      const response = await request(app)
        .put(`/api/loans/${loanId}/approve`)
        .send({
          userId: 'manager1'
        })
        .expect(200);

      expect(response.body.loan.status).toBe('approved');
      expect(response.body.loan.approvedBy).toBe('manager1');
    });

    it('should not allow approving an already approved loan', async () => {
      await request(app)
        .put(`/api/loans/${loanId}/approve`)
        .send({
          userId: 'manager1'
        });

      const response = await request(app)
        .put(`/api/loans/${loanId}/approve`)
        .send({
          userId: 'manager2'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Loan cannot be approved');
      expect(response.body.message).toContain('approved');
    });
  });

  describe('Integration Tests - Full Workflow', () => {
    it('should complete full loan lifecycle: create -> review -> approve', async () => {
      const createResponse = await request(app)
        .post('/api/loans')
        .send({
          amount: 15000,
          purpose: 'Business expansion',
          userId: 'user123'
        })
        .expect(201);

      const loanId = createResponse.body.loan.id;
      expect(createResponse.body.loan.status).toBe('pending');

      const reviewResponse = await request(app)
        .put(`/api/loans/${loanId}/review`)
        .send({
          status: 'reviewed',
          comments: 'Documents verified',
          userId: 'officer1'
        })
        .expect(200);

      expect(reviewResponse.body.loan.status).toBe('reviewed');

      const approveResponse = await request(app)
        .put(`/api/loans/${loanId}/approve`)
        .send({
          comments: 'Approved',
          userId: 'manager1'
        })
        .expect(200);

      expect(approveResponse.body.loan.status).toBe('approved');
      expect(approveResponse.body.loan).toHaveProperty('reviewedAt');
      expect(approveResponse.body.loan).toHaveProperty('approvedAt');
    });

    it('should handle rejected loan workflow', async () => {
      const createResponse = await request(app)
        .post('/api/loans')
        .send({
          amount: 8000,
          purpose: 'Vacation',
          userId: 'user456'
        })
        .expect(201);

      const loanId = createResponse.body.loan.id;

      const rejectResponse = await request(app)
        .put(`/api/loans/${loanId}/review`)
        .send({
          status: 'rejected',
          comments: 'Insufficient credit score',
          userId: 'officer1'
        })
        .expect(200);

      expect(rejectResponse.body.loan.status).toBe('rejected');

      await request(app)
        .put(`/api/loans/${loanId}/approve`)
        .send({
          userId: 'manager1'
        })
        .expect(400);
    });
  });
});