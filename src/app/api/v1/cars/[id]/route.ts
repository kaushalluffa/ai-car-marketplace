import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { serializeCarData } from "@/lib/helper";
import { CarStatus } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
      return NextResponse.json(
        {
          success: false,
          error: "Car not found",
        },
        { status: 404 }
      );
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

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("Error fetching car details:", error);
    return NextResponse.json(
      {
        error: "Error fetching car details: " + error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // First, fetch the car to get its images
    const car = await db.car.findUnique({
      where: { id },
      select: { images: true },
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

    // Delete the car from the database
    await db.car.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting car:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status, featured } = await request.json();

    const updateData: { status: CarStatus; featured: boolean } = {
      status: CarStatus.UNAVAILABLE,
      featured: false,
    };

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

    return NextResponse.json({
      success: true,
      message: "Car updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating car status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
