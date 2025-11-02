import { Router } from 'express';
import * as loanController from '../controllers/loanControllers';
 
const router = Router();
 
router.post('/', loanController.createLoan)
router.put('/:id/review', loanController.reviewLoan);
router.get('/', loanController.getLoans);
router.put('/:id/approve', loanController.approveLoan);
 
export default router;