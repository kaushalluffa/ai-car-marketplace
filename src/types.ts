// This file is auto-generated from prisma/schema.prisma
// Do not edit manually. Update the schema and regenerate if needed.

import { Decimal } from "@prisma/client/runtime/library";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum CarStatus {
  AVAILABLE = "AVAILABLE",
  UNAVAILABLE = "UNAVAILABLE",
  SOLD = "SOLD",
}

export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
  savedCars: UserSavedCar[];
  testDrives: TestDriveBooking[];
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: Decimal;
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  seats?: number | null;
  description: string;
  status: CarStatus[number];
  featured: boolean;
  images: string[];
  savedBy?: UserSavedCar[];
  testDriveBookings?: TestDriveBooking[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DealershipInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: WorkingHour[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHour {
  id: string;
  dealershipId: string;
  dealership: DealershipInfo;
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSavedCar {
  id: string;
  userId: string;
  user: User;
  carId: string;
  car: Car;
  savedAt: Date;
}

export interface TestDriveBooking {
  id: string;
  carId: string;
  car: Car;
  userId: string;
  user: User;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FiltersData {
  makes: string[];
  bodyTypes: string[];
  fuelTypes: string[];
  transmissions: string[];
  priceRange: PriceRange;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface CurrentFilter {
  make: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  priceRange: number[];
  priceRangeMin: number;
  priceRangeMax: number;
}

export interface APICar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  seats: number;
  description: string;
  status: string;
  featured: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  wishlisted: boolean;
}

export interface APIPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
