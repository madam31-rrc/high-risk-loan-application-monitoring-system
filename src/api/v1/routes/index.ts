import { Router } from 'express';
import loanRoutes from './loanRoutes';

const router = Router();

router.use('/loans', loanRoutes);

export default router;