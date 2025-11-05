// External library imports
import { Response, NextFunction } from "express";
import { Request } from "express-serve-static-core";

// Internal module imports
import { AuthorizationOptions } from "../models/authorizationOptions";
import { AuthorizationError } from "../errors/error";

/**
 * Middleware to check if a user is authorized based on their role or UID.
 * Now integrated with centralized error handling system.
 *
 * This middleware:
 * - Checks if the user has required roles
 * - Optionally allows users to access their own resources
 * - Throws standardized AuthorizationError for access denied scenarios
 *
 * @param {AuthorizationOptions} opts - The authorization options.
 * @returns {MiddlewareFunction} The middleware function.
 */
const isAuthorized = (opts: AuthorizationOptions) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const { role, uid } = res.locals;
            const { id } = req.params;

            // Allow if the same user is accessing their own data
            if (opts.allowSameUser && id && uid === id) {
                return next();
            }

            // If no role exists on the user, throw Forbidden response
            if (!role) {
                throw new AuthorizationError(
                    "Forbidden: No role found",
                    "ROLE_NOT_FOUND"
                );
            }

            // Check if the user's role matches one of the allowed roles
            if (opts.hasRole.includes(role)) {
                return next();
            }

            // If the role is not authorized, throw Forbidden response
            throw new AuthorizationError(
                "Forbidden: Insufficient role",
                "INSUFFICIENT_ROLE"
            );
        } catch (error) {
            // Pass errors to the centralized error handler
            next(error);
        }
    };
};

export default isAuthorized;