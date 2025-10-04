"use server";

import { db } from "@/lib/prisma";
import { serializeCarData } from "@/lib/helper";
import { ensureUserInDatabase } from "@/lib/userSync";
import { BookingStatus } from "@/lib/enums";

export async function fetchUserDriveBookings() {
  try {
    const { user, error } = await ensureUserInDatabase();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user's test drive bookings
    const bookings = await db.testDriveBooking.findMany({
      where: { userId: user.id },
      include: {
        car: true,
      },
      orderBy: { bookingDate: "desc" },
    });

    // Format the bookings
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializeCarData(booking.car),
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error: any) {
    console.error("Error fetching test drives:", error);
    return {
      success: false,
      error: "Error fetching test drives: " + error.message,
    };
  }
}

export async function scheduleDriveSession(
  carId: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  notes: string
) {
  try {
    const { user, error } = await ensureUserInDatabase();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if car exists and is available
    const car = await db.car.findUnique({
      where: { id: carId, status: "AVAILABLE" },
    });

    if (!car) {
      return { success: false, error: "Car not available for test drive" };
    }

    // Check if slot is already booked
    const existingBooking = await db.testDriveBooking.findFirst({
      where: {
        carId,
        bookingDate: new Date(bookingDate),
        startTime,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      return {
        success: false,
        error: "This time slot is already booked. Please select another time.",
      };
    }

    // Create the booking
    const booking = await db.testDriveBooking.create({
      data: {
        carId,
        userId: user.id,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        notes: notes || null,
        status: "PENDING",
      },
    });

    return {
      success: true,
      data: booking,
      message: "Test drive booked successfully",
    };
  } catch (error: any) {
    console.error("Error booking test drive:", error);
    return {
      success: false,
      error: "Error booking test drive: " + error.message,
    };
  }
}

export async function modifyDriveBookingStatus(
  bookingId: string,
  status: BookingStatus
) {
  try {
    const { user, error } = await ensureUserInDatabase();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update the booking status
    const booking = await db.testDriveBooking.update({
      where: { id: bookingId },
      data: { status },
    });

    return {
      success: true,
      data: booking,
      message: "Test drive status updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating test drive status:", error);
    return {
      success: false,
      error: "Error updating test drive status: " + error.message,
    };
  }
}

export async function cancelDriveBooking(bookingId: string) {
  try {
    const { user, error } = await ensureUserInDatabase();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if booking exists and belongs to user
    const booking = await db.testDriveBooking.findFirst({
      where: {
        id: bookingId,
        userId: user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found or cannot be cancelled",
      };
    }

    // Update status to cancelled
    await db.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    return {
      success: true,
      message: "Test drive cancelled successfully",
    };
  } catch (error: any) {
    console.error("Error cancelling test drive:", error);
    return {
      success: false,
      error: "Error cancelling test drive: " + error.message,
    };
  }
}

export async function cancelDriveBookingAdmin(bookingId: string) {
  try {
    const { user, error } = await ensureUserInDatabase();

    if (error || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user is admin
    if (user.role !== "ADMIN") {
      return { success: false, error: "Admin access required" };
    }

    // Update status to cancelled
    await db.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    return {
      success: true,
      message: "Test drive cancelled successfully",
    };
  } catch (error: any) {
    console.error("Error cancelling test drive:", error);
    return {
      success: false,
      error: "Error cancelling test drive: " + error.message,
    };
  }
}

