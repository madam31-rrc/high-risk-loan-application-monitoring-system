// ============================================
import { Router } from "express";
import {
  setUserClaims,
  getUserById,
  listUsers,
} from "../controllers/adminController.ts";
import authenticate from "../middleware/authenticate";

const router = Router();

router.get(
  "/:userId",
  authenticate,
  getUserById
);


router.post(
  "/users/:userId/claims",
  authenticate,
  setUserClaims
);

router.get(
  "/users",
  authenticate,
  listUsers
);

export default router;
