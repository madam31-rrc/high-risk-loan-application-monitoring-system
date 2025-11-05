/**
 * HTTP status codes used throughout the application
 */
export const HTTP_STATUS = {
    // Success responses
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204, // NEW: For successful DELETE operations, etc.

    // Client error responses
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401, // NEW: For authentication errors (invalid token)
    FORBIDDEN: 403, // NEW: For authorization errors (insufficient role)
    NOT_FOUND: 404,
    CONFLICT: 409, // NEW: For resource conflicts
    UNPROCESSABLE_ENTITY: 422, // NEW: For validation errors

    // Server error responses
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501, // NEW: For unimplemented features
    BAD_GATEWAY: 502, // NEW: For external service failures
    SERVICE_UNAVAILABLE: 503, // NEW: For temporary service outages
} as const;