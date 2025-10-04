"use server";

import { db } from "@/lib/prisma";
import { serializeCarData } from "@/lib/helper";
import { ensureUserInDatabase } from "@/lib/userSync";

export async function fetchUserWishlist() {
  try {
    const { user, error } = await ensureUserInDatabase();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get saved cars with their details
    const savedCars = await db.userSavedCar.findMany({
      where: { userId: user.id },
      include: {
        car: true,
      },
      orderBy: { savedAt: "desc" },
    });

    // Extract and format car data
    const cars = savedCars.map((saved) => serializeCarData(saved.car));

    return {
      success: true,
      data: cars,
    };
  } catch (error : any) {
    console.error("Error fetching saved cars:", error);
    return {
      success: false,
      error: "Error fetching saved cars: " + error.message,
    };
  }
}

export async function toggleWishlistItem(carId: string) {
  try {
    const { user, error } = await ensureUserInDatabase();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if car exists
    const car = await db.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return { success: false, error: "Car not found" };
    }

    // Check if car is already saved
    const existingSave = await db.userSavedCar.findUnique({
      where: {
        userId_carId: {
          userId: user.id,
          carId,
        },
      },
    });

    // If car is already saved, remove it
    if (existingSave) {
      await db.userSavedCar.delete({
        where: {
          userId_carId: {
            userId: user.id,
            carId,
          },
        },
      });

      return {
        success: true,
        data: { saved: false },
        message: "Car removed from favorites",
      };
    }

    // If car is not saved, add it
    await db.userSavedCar.create({
      data: {
        userId: user.id,
        carId,
      },
    });

    return {
      success: true,
      data: { saved: true },
      message: "Car added to favorites",
    };
  } catch (error: any) {
    console.error("Error toggling saved car:", error);
    return {
      success: false,
      error: "Error toggling saved car: " + error.message,
    };
  }
}
