import { NextResponse } from "next/server";
import { ensureUserInDatabase } from "./userSync";

/**
 * API Middleware for routes that require authentication
 * Automatically handles user authentication and database synchronization
 *
 * Usage:
 * export const GET = withAuth(async (request, { user }) => {
 *   // user is guaranteed to exist and be synced with database
 *   return NextResponse.json({ data: user });
 * });
 */
export const withAuth = (
  handler: (request: Request, context: any) => Promise<NextResponse>
) => {
  return async (request: Request, context: any) => {
    try {
      // Ensure user exists in database and get user data
      const { user, error } = await ensureUserInDatabase();

      if (error || !user) {
        return NextResponse.json(
          {
            success: false,
            error: error || "Authentication required",
          },
          { status: 401 }
        );
      }

      // Add user to context for the handler
      context.user = user;

      // Call the original handler with user in context
      return await handler(request, context);
    } catch (error) {
      console.error("API Middleware Error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  };
};

/**
 * API Middleware for admin-only routes
 * Requires authentication AND admin role
 *
 * Usage:
 * export const GET = withAdminAuth(async (request, { user }) => {
 *   // user is guaranteed to be an admin
 *   return NextResponse.json({ data: user });
 * });
 */
export const withAdminAuth = (
  handler: (request: Request, context: any) => Promise<NextResponse>
) => {
  return async (request: Request, context: any) => {
    try {
      // Ensure user exists in database and get user data
      const { user, error } = await ensureUserInDatabase();

      if (error || !user) {
        return NextResponse.json(
          {
            success: false,
            error: error || "Authentication required",
          },
          { status: 401 }
        );
      }

      // Check if user is admin
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: "Admin access required",
          },
          { status: 403 }
        );
      }

      // Add user to context for the handler
      context.user = user;

      // Call the original handler with admin user in context
      return await handler(request, context);
    } catch (error) {
      console.error("Admin API Middleware Error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 }
      );
    }
  };
};

/**
 * API Middleware for optional authentication
 * User may or may not be authenticated
 *
 * Usage:
 * export const GET = withOptionalAuth(async (request, { user }) => {
 *   if (user) {
 *     // User is authenticated and synced
 *   } else {
 *     // User is not authenticated
 *   }
 * });
 */
export const withOptionalAuth = (
  handler: (request: Request, context: any) => Promise<NextResponse>
) => {
  return async (request: Request, context: any) => {
    try {
      // Try to get user, but don't fail if not authenticated
      const { user, error } = await ensureUserInDatabase();

      // Add user to context (may be null)
      context.user = user;

      // Call the original handler
      return await handler(request, context);
    } catch (error) {
      console.error("Optional Auth API Middleware Error:", error);
      // Still call handler even if auth fails
      context.user = null;
      return await handler(request, context);
    }
  };
};

/**
 * Utility function to create standardized API responses
 */
export const createApiResponse = (
  data: any,
  success = true,
  message = null
) => {
  return NextResponse.json({
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Utility function to create error responses
 */
export const createErrorResponse = (error: any, status = 500) => {
  return NextResponse.json(
    {
      success: false,
      error: error.message || error,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};
