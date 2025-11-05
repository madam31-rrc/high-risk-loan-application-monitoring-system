// External library imports
import { Request, Response, NextFunction } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { AuthenticationError } from "../errors/error";
import { getErrorMessage, getErrorCode } from "../utils/errorUtils";

// Internal module imports
import { auth } from "../../../config/firebaseConfig";

/**
 * Middleware to authenticate a user using a Firebase ID token.
 * Now integrated with centralized error handling system.
 *
 * This middleware:
 * - Extracts the token from the Authorization header
 * - Verifies the token with Firebase Auth
 * - Stores user information in res.locals for downstream middleware
 * - Throws standardized AuthenticationError for any failures
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 */
const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token: string | undefined = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : undefined;

        if (!token) {
            throw new AuthenticationError(
                "Unauthorized: No token provided",
                "TOKEN_NOT_FOUND"
            );
        }

        const decodedToken: DecodedIdToken = await auth.verifyIdToken(
            token
        );
        res.locals.uid = decodedToken.uid;
        res.locals.role = decodedToken.role;
        console.log('res localts ', res.locals)
        next();
    } catch (error: unknown) {
        if (error instanceof AuthenticationError) {
            // Re-throw authentication errors to be handled by error middleware
            next(error);
        } else if (error instanceof Error) {
            next(
                new AuthenticationError(
                    `Unauthorized: ${getErrorMessage(error)}`,
                    getErrorCode(error)
                )
            );
        } else {
            next(
                new AuthenticationError(
                    "Unauthorized: Invalid token",
                    "TOKEN_INVALID"
                )
            );
        }
    }
};

export default authenticate;