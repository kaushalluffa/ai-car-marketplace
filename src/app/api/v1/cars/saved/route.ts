import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { serializeCarData } from "@/lib/helper";


export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Get the user from our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
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

    return NextResponse.json({
      success: true,
      data: cars,
    });
  } catch (error:any) {
    console.error("Error fetching saved cars:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { carId } = await request.json();

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if car exists
    const car = await db.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return NextResponse.json(
        {
          success: false,
          error: "Car not found",
        },
        { status: 404 }
      );
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

      return NextResponse.json({
        success: true,
        saved: false,
        message: "Car removed from favorites",
      });
    }

    // If car is not saved, add it
    await db.userSavedCar.create({
      data: {
        userId: user.id,
        carId,
      },
    });

    return NextResponse.json({
      success: true,
      saved: true,
      message: "Car added to favorites",
    });
  } catch (error:any) {
    console.error("Error toggling saved car:", error);
    return NextResponse.json(
      {
        error: "Error toggling saved car: " + error.message,
      },
      { status: 500 }
    );
  }
}
