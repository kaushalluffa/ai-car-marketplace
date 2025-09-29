import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { serializeCarData } from "@/lib/helper";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const make = searchParams.get("make") || "";
    const bodyType = searchParams.get("bodyType") || "";
    const fuelType = searchParams.get("fuelType") || "";
    const transmission = searchParams.get("transmission") || "";
    const minPrice = searchParams.get("minPrice") || "0";
    const maxPrice = searchParams.get("maxPrice") || "999999999";
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1") || 1;
    const limit = parseInt(searchParams.get("limit") || "6") || 6;

    // Get current user if authenticated
    const { isAuthenticated } = await auth();
    let dbUser = null;
    // Protect the route by checking if the user is signed in
    if (!isAuthenticated) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    // Use `currentUser()` to get the Backend API User object
    const user = await currentUser();

    if (isAuthenticated && user) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: user.id },
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
    const serializedCars = cars?.map((car) =>
      serializeCarData(car, wishlisted.has(car.id))
    );

    return NextResponse.json({
      success: true,
      data: serializedCars,
      pagination: {
        total: totalCars,
        page,
        limit,
        pages: Math.ceil(totalCars / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching cars:", error);
    return NextResponse.json(
      {
        error: "Error fetching cars: " + error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
      const { isAuthenticated } = await auth();
      let dbUser = null;
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Use `currentUser()` to get the Backend API User object
    const user = await currentUser();

    if (isAuthenticated && user) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: user.id },
      });
    }

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { carData, images } = await request.json();

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
        return NextResponse.json(
          { error: `Failed to upload image: ${uploadResult.error}` },
          { status: 500 }
        );
      }

      imageUrls.push(uploadResult.url);
    }

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid images were uploaded" },
        { status: 400 }
      );
    }

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
        status: carData.status,
        featured: carData.featured,
        images: imageUrls, // Store the array of image URLs
      },
    });

    return NextResponse.json({
      success: true,
      data: car,
    });
  } catch (error: any) {
    console.error("Error adding car:", error);
    return NextResponse.json(
      {
        error: "Error adding car: " + error.message,
      },
      { status: 500 }
    );
  }
}
