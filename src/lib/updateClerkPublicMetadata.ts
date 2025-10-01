import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function updateClerkPublicMetadata() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated) {
    return { message: "Unauthorized" };
  }
  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        applicationName: "AI Car Marketplace",
        applicationType: "Car Marketplace",
      },
    });
      return { message: res.publicMetadata}
  } catch (err) {
      return { error: 'There was an error updating public metadata'}
  }
}
