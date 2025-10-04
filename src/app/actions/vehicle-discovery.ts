"use server";

import { db } from "@/lib/prisma";
import { serializeCarData } from "@/lib/helper";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export async function fetchFeaturedVehicles() {
  try {
    // Get current user if authenticated
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    // Get featured cars
    const cars = await db.car.findMany({
      where: {
        status: "AVAILABLE",
        featured: true,
      },
      take: 6,
      orderBy: { createdAt: "desc" },
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
    };
  } catch (error: any) {
    console.error("Error fetching featured cars:", error);
    return {
      success: false,
      error: "Error fetching featured cars: " + error.message,
    };
  }
}

export async function fetchVehicleFilters() {
  try {
    // Get all unique values for filters
    const [makes, bodyTypes, fuelTypes, transmissions] = await Promise.all([
      db.car.findMany({
        where: { status: "AVAILABLE" },
        select: { make: true },
        distinct: ["make"],
        orderBy: { make: "asc" },
      }),
      db.car.findMany({
        where: { status: "AVAILABLE" },
        select: { bodyType: true },
        distinct: ["bodyType"],
        orderBy: { bodyType: "asc" },
      }),
      db.car.findMany({
        where: { status: "AVAILABLE" },
        select: { fuelType: true },
        distinct: ["fuelType"],
        orderBy: { fuelType: "asc" },
      }),
      db.car.findMany({
        where: { status: "AVAILABLE" },
        select: { transmission: true },
        distinct: ["transmission"],
        orderBy: { transmission: "asc" },
      }),
    ]);

    // Get price range
    const priceRange = await db.car.aggregate({
      where: { status: "AVAILABLE" },
      _min: { price: true },
      _max: { price: true },
    });

    return {
      success: true,
      data: {
        makes: makes.map((car) => car.make),
        bodyTypes: bodyTypes.map((car) => car.bodyType),
        fuelTypes: fuelTypes.map((car) => car.fuelType),
        transmissions: transmissions.map((car) => car.transmission),
        priceRange: {
          min: priceRange._min.price || 0,
          max: priceRange._max.price || 0,
        },
      },
    };
  } catch (error: any) {
    console.error("Error fetching car filters:", error);
    return {
      success: false,
      error: "Error fetching car filters: " + error.message,
    };
  }
}

export async function searchVehicleInventory(searchParams: any = {}) {
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
      limit = 6,
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

    if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
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
    console.error("Error fetching car listing:", error);
    return {
      success: false,
      error: "Error fetching car listing: " + error.message,
    };
  }
}
