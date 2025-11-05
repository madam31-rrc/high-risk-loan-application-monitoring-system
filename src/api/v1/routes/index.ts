import { Router } from 'express';
import loanRoutes from './loanRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/loans', loanRoutes);

router.use('/admin', adminRoutes);

export default router;