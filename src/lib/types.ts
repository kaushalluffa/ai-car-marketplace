export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum CarStatus {
  AVAILABLE = "AVAILABLE",
  UNAVAILABLE = "UNAVAILABLE",
  SOLD = "SOLD",
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
  email: string;
  name?: string | null;
  imageUrl?: string | null;
  role: UserRole;
}

export interface Car {
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
  seats: number | null;
  description: string;
  status: CarStatus[number];
  featured: boolean;
  images: string[];
  wishlisted?: boolean; // Optional field to indicate if the car is wishlisted by the user
}

export interface TestDriveBooking {
  id: string;
  carId: string;
  userId: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface FiltersData {
  makes: string[];
  bodyTypes: string[];
  fuelTypes: string[];
  transmissions: string[];
  priceRange: PriceRange;
}

export interface DateTimeData {
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrentFilters {
  make: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  priceRange: number[];
  priceRangeMin?: number;
  priceRangeMax?: number;
}