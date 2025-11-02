import { Router } from 'express';
import { loanController } from '../controllers/loanControllers';

const router = Router();;

router.post('/', loanController.createLoan);

router.get('/', loanController.getLoans);

router.put('/:id/review', loanController.reviewLoan);

router.put('/:id/approve', loanController.approveLoan);

export default router;