import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import updateClerkPublicMetadata from "./updateClerkPublicMetadata";

/**
 * Ensures user exists in database and returns user data
 * This function should be called in all API routes that need user data
 * It will automatically create the user if they don't exist
 */
export const ensureUserInDatabase = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { user: null, error: "Unauthorized" };
    }

    // Check if user already exists in our database
    let user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (user) {
      return { user, error: null };
    }

    // If user doesn't exist, we need to get their data from Clerk
    // and create them in our database
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return { user: null, error: "User not found in Clerk" };
    }

    // Create new user in our database
    const name =
      clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.lastName || "User";

    const newUser = await db.user.create({
      data: {
        clerkUserId: clerkUser.id,
        name,
        imageUrl: clerkUser.imageUrl,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
      },
    });

    const userClerkPublicMetadataRes = await updateClerkPublicMetadata();

    return { user: newUser, error: null, userClerkPublicMetadataRes };
  } catch (error: any) {
    console.error("Error in ensureUserInDatabase:", error);
    return { user: null, error: error.message };
  }
};
