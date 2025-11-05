import { Response, Request } from 'express';
import { auth } from '../../../config/firebaseConfig';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "user" | "officer" | "manager";
    email?: string;
  };
}

export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.params;

    const userRecord = await auth.getUser(userId);
    const customClaims = userRecord.customClaims || {};

    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
        },
        role: customClaims.role || 'user',
        customClaims,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);

    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(500).json({ error: 'Failed to retrieve user' });
  }
};




/**
 * Set custom claims (roles) for a user
 * POST /api/v1/admin/users/:userId/claims
 */
export const setUserClaims = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { role, customClaims } = req.body;

    // Validate role if provided
    if (role && !['user', 'officer', 'manager'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be: user, officer, or manager',
      });
    }

    // Prepare claims object
    const claims = customClaims || {};
    if (role) {
      claims.role = role;
    }

    // Set custom claims
    await auth.setCustomUserClaims(userId, claims);

    // Get updated user record
    const userRecord = await auth.getUser(userId);

    res.json({
      message: 'User claims updated successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        customClaims: userRecord.customClaims,
      },
    });
  } catch (error: any) {
    console.error('Error setting user claims:', error);

    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(500).json({ error: 'Failed to set user claims' });
  }
};

/**
 * List all users (with pagination)
 * GET /api/v1/admin/users
 */
export const listUsers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const maxResults = parseInt(req.query.limit as string) || 100;
    const pageToken = req.query.pageToken as string | undefined;

    const listUsersResult = await auth.listUsers(maxResults, pageToken);

    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      disabled: userRecord.disabled,
      role: userRecord.customClaims?.role || 'user',
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      },
    }));

    res.json({
      users,
      pageToken: listUsersResult.pageToken,
      count: users.length,
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
};

/**
 * Delete a user
 * DELETE /api/v1/admin/users/:userId
 */
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { userId } = req.params;

    await auth.deleteUser(userId);

    res.json({
      message: 'User deleted successfully',
      userId,
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);

    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(500).json({ error: 'Failed to delete user' });
  }
};
