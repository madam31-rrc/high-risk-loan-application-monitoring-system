export interface AuthorizationOptions {
    hasRole: Array<"user" | "officer" | "manager">;
    allowSameUser?: boolean;
}