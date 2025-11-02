import request from 'supertest';
import app from '../src/app';

describe('Loan Application API Tests', () => {
  
  describe('POST /api/v1/loans - Create Loan', () => {
    it('should create a new loan application successfully', async () => {
      const loanData = {
        amount: 50000,
        purpose: 'Business expansion',
        userId: 'user_123'
      };

      const response = await request(app)
        .post('/api/v1/loans')
        .send(loanData)
        .expect(201);

      expect(response.body.message).toBe('Loan application created successfully');
      expect(response.body.loan).toHaveProperty('id');
      expect(response.body.loan.amount).toBe(loanData.amount);
      expect(response.body.loan.status).toBe('pending');
    });

    it('should return 400 if amount is missing', async () => {
      const loanData = {
        purpose: 'Business expansion',
        userId: 'user_123'
      };

      const response = await request(app)
        .post('/api/v1/loans')
        .send(loanData)
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });

    it('should return 400 if amount is not a positive number', async () => {
      const loanData = {
        amount: -1000,
        purpose: 'Business expansion',
        userId: 'user_123'
      };

      const response = await request(app)
        .post('/api/v1/loans')
        .send(loanData)
        .expect(400);

      expect(response.body.error).toBe('Amount must be a positive number');
    });
  });

  describe('GET /api/v1/loans - Get Loans', () => {
    it('should retrieve all loan applications', async () => {
      const response = await request(app)
        .get('/api/v1/loans')
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('loans');
      expect(Array.isArray(response.body.loans)).toBe(true);
    });

    it('should filter loans by status', async () => {
      await request(app)
        .post('/api/v1/loans')
        .send({ amount: 10000, purpose: 'Test', userId: 'user_1' });

      const response = await request(app)
        .get('/api/v1/loans?status=pending')
        .expect(200);

      expect(response.body.loans.every((loan: any) => loan.status === 'pending')).toBe(true);
    });
  });

  describe('PUT /api/v1/loans/:id/review - Review Loan', () => {
    it('should review a pending loan application', async () => {
      const createResponse = await request(app)
        .post('/api/v1/loans')
        .send({ amount: 25000, purpose: 'Equipment', userId: 'user_456' });

      const loanId = createResponse.body.loan.id;

      const reviewData = {
        status: 'reviewed',
        userId: 'officer_789',
        comments: 'All documents verified'
      };

      const response = await request(app)
        .put(`/api/v1/loans/${loanId}/review`)
        .send(reviewData)
        .expect(200);

      expect(response.body.message).toBe('Loan application reviewed successfully');
      expect(response.body.loan.status).toBe('reviewed');
    });

    it('should return 404 if loan not found', async () => {
      const reviewData = {
        status: 'reviewed',
        userId: 'officer_789'
      };

      const response = await request(app)
        .put('/api/v1/loans/nonexistent_id/review')
        .send(reviewData)
        .expect(404);

      expect(response.body.error).toBe('Loan application not found');
    });

    it('should return 400 for invalid status', async () => {
      const createResponse = await request(app)
        .post('/api/v1/loans')
        .send({ amount: 15000, purpose: 'Test', userId: 'user_1' });

      const loanId = createResponse.body.loan.id;

      const response = await request(app)
        .put(`/api/v1/loans/${loanId}/review`)
        .send({ status: 'invalid_status', userId: 'officer_1' })
        .expect(400);

      expect(response.body.error).toBe('Invalid status');
    });
  });

  describe('PUT /api/v1/loans/:id/approve - Approve Loan', () => {
    it('should approve a reviewed loan application', async () => {
      const createResponse = await request(app)
        .post('/api/v1/loans')
        .send({ amount: 30000, purpose: 'Real Estate', userId: 'user_999' });

      const loanId = createResponse.body.loan.id;

      await request(app)
        .put(`/api/v1/loans/${loanId}/review`)
        .send({ status: 'reviewed', userId: 'officer_1' });

      const approvalData = {
        userId: 'manager_111',
        comments: 'Approved for disbursement'
      };

      const response = await request(app)
        .put(`/api/v1/loans/${loanId}/approve`)
        .send(approvalData)
        .expect(200);

      expect(response.body.message).toBe('Loan approved successfully');
      expect(response.body.loan.status).toBe('approved');
    });

    it('should return 400 if loan is not reviewed yet', async () => {
      const createResponse = await request(app)
        .post('/api/v1/loans')
        .send({ amount: 20000, purpose: 'Test', userId: 'user_2' });

      const loanId = createResponse.body.loan.id;

      const response = await request(app)
        .put(`/api/v1/loans/${loanId}/approve`)
        .send({ userId: 'manager_1' })
        .expect(400);

      expect(response.body.error).toBe('Loan cannot be approved');
    });
  });

  describe('General Endpoints', () => {
    it('should return server info at root endpoint', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('version');
    });

    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is healthy');
    });

    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});