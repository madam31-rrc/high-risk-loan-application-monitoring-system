/**
 * Extracts error message from unknown error types
 * @param error - The error object
 * @returns The error message as a string
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

/**
 * Extracts error code from Firebase or other errors
 * @param error - The error object
 * @returns The error code as a string
 */
export const getErrorCode = (error: unknown): string => {
    if (error instanceof Error) {
        // Firebase errors often have a 'code' property
        const firebaseError = error as any;
        return firebaseError.code || "UNKNOWN_ERROR";
    }
    return "UNKNOWN_ERROR";
};