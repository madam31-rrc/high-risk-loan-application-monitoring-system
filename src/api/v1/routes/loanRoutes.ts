import { Router } from 'express';
import { loanController } from '../controllers/loanControllers';
import isAuthorized from '../middleware/authorize';
import authenticate from '../middleware/authenticate';

const router = Router();

router.post('/', authenticate,
    isAuthorized({ hasRole: ["user"] }), loanController.createLoan);

router.get('/', authenticate,
    isAuthorized({ hasRole: ["officer", "manager"] }), loanController.getLoans);

router.put('/:id/review',authenticate,
    isAuthorized({ hasRole: ["officer"] }), loanController.reviewLoan);

router.put('/:id/approve',authenticate,
    isAuthorized({ hasRole: [ "manager"] }), loanController.approveLoan);

export default router;