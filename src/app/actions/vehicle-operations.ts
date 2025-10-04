"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { serializeCarData } from "@/lib/helper";
import { ensureUserInDatabase } from "@/lib/userSync";
import { Prisma } from "@prisma/client";
import { Car, CarStatus } from "../../lib/types";

export async function fetchVehicleInventory(
  searchParams: {
    search?: string;
    make?: string;
    bodyType?: string;
    fuelType?: string;
    transmission?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    const {
      search = "",
      make = "",
      bodyType = "",
      fuelType = "",
      transmission = "",
      minPrice = "0",
      maxPrice = "999999999",
      sortBy = "newest",
      page = 1,
      limit = 10,
    } = searchParams;

    // Get current user if authenticated
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    // Build where conditions
    let where: Prisma.CarWhereInput = {
      status: "AVAILABLE",
    };

    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (make) where.make = { equals: make, mode: "insensitive" };
    if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
    if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
    if (transmission)
      where.transmission = { equals: transmission, mode: "insensitive" };

    // Add price range
    where.price = {
      gte: parseFloat(minPrice) || 0,
    };

    if (maxPrice && parseFloat(maxPrice) < Number.MAX_SAFE_INTEGER) {
      where.price.lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case "priceAsc":
        orderBy = { price: "asc" };
        break;
      case "priceDesc":
        orderBy = { price: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Get total count for pagination
    const totalCars = await db.car.count({ where });

    // Execute the main query
    const cars = await db.car.findMany({
      where,
      take: limit,
      skip,
      orderBy,
    });

    // If we have a user, check which cars are wishlisted
    let wishlisted = new Set();
    if (dbUser) {
      const savedCars = await db.userSavedCar.findMany({
        where: { userId: dbUser.id },
        select: { carId: true },
      });

      wishlisted = new Set(savedCars.map((saved) => saved.carId));
    }

    // Serialize and check wishlist status
    const serializedCars = cars.map((car) =>
      serializeCarData(car, wishlisted.has(car.id))
    );

    return {
      success: true,
      data: serializedCars,
      pagination: {
        total: totalCars,
        page,
        limit,
        pages: Math.ceil(totalCars / limit),
      },
    };
  } catch (error: any) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: "Error fetching cars: " + error.message,
    };
  }
}

export async function createVehicleListing(carData: Car, images: string[]) {
  try {
    const { user, error } = await ensureUserInDatabase();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Create a unique folder name for this car's images
    const carId = require("uuid").v4();
    const folderPath = `cars/${carId}`;

    // Upload all images to Cloudinary
    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];

      // Skip if image data is not valid
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        console.warn("Skipping invalid image data");
        continue;
      }

      // Upload image to Cloudinary
      const uploadResult =
        await require("@/lib/cloudinary").uploadImageFromBase64(
          base64Data,
          folderPath
        );

      if (!uploadResult.success) {
        console.error("Error uploading image:", uploadResult.error);
        return {
          success: false,
          error: `Failed to upload image: ${uploadResult.error}`,
        };
      }

      imageUrls.push(uploadResult.url);
    }

    if (imageUrls.length === 0) {
      return { success: false, error: "No valid images were uploaded" };
    }
    const newCarStatus: CarStatus =
      CarStatus[carData.status as keyof typeof CarStatus];
    // Add the car to the database
    const car = await db.car.create({
      data: {
        id: carId, // Use the same ID we used for the folder
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats,
        description: carData.description,
        status: newCarStatus,
        featured: carData.featured,
        images: imageUrls, // Store the array of image URLs
      },
    });

    return {
      success: true,
      data: car,
    };
  } catch (error: any) {
    console.error("Error adding car:", error);
    return {
      success: false,
      error: "Error adding car: " + error.message,
    };
  }
}

export async function retrieveVehicleDetails(id: string) {
  try {
    // Get current user if authenticated
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    // Get car details
    const car = await db.car.findUnique({
      where: { id },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Check if car is wishlisted by user
    let isWishlisted = false;
    if (dbUser) {
      const savedCar = await db.userSavedCar.findUnique({
        where: {
          userId_carId: {
            userId: dbUser.id,
            carId: id,
          },
        },
      });

      isWishlisted = !!savedCar;
    }

    // Check if user has already booked a test drive for this car
    const existingTestDrive = await db.testDriveBooking.findFirst({
      where: {
        carId: id,
        userId: dbUser?.id,
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let userTestDrive = null;

    if (existingTestDrive) {
      userTestDrive = {
        id: existingTestDrive.id,
        status: existingTestDrive.status,
        bookingDate: existingTestDrive.bookingDate.toISOString(),
      };
    }

    // Get dealership info for test drive availability
    const dealership = await db.dealershipInfo.findFirst({
      include: {
        workingHours: true,
      },
    });

    return {
      success: true,
      data: {
        ...serializeCarData(car, isWishlisted),
        testDriveInfo: {
          userTestDrive,
          dealership: dealership
            ? {
                ...dealership,
                createdAt: dealership.createdAt.toISOString(),
                updatedAt: dealership.updatedAt.toISOString(),
                workingHours: dealership.workingHours.map((hour) => ({
                  ...hour,
                  createdAt: hour.createdAt.toISOString(),
                  updatedAt: hour.updatedAt.toISOString(),
                })),
              }
            : null,
        },
      },
    };
  } catch (error: any) {
    console.error("Error fetching car details:", error);
    return {
      success: false,
      error: "Error fetching car details: " + error.message,
    };
  }
}

export async function removeVehicleListing(id: string) {
  try {
    const { user, error } = await ensureUserInDatabase();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // First, fetch the car to get its images
    const car = await db.car.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Delete the car from the database
    await db.car.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Car deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function modifyVehicleStatus(
  id: string,
  status: CarStatus,
  featured: boolean
) {
  try {
    const { user, error } = await ensureUserInDatabase();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const updateData: Prisma.CarUpdateInput = {};

    if (status !== undefined) {
      updateData.status = status;
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    // Update the car
    await db.car.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: "Car updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating car status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
