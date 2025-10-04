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

export interface UserTestDrive {
  id: string;
  status: BookingStatus[number];
  bookingDate: Date | string;
  startTime: string;
  endTime: string;
}

export interface TestDriveInfo {
  dealership: DealerShip | null;
  userTestDrive: UserTestDrive | null;
}
export interface DealerShip {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  workingHours: WorkingHour[];
}

export interface WorkingHour {
  id: string;
  dealershipId: string;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDetails {
  date: string;
  timeSlot: string;
  notes: string | null;
}
export interface ReservationItem {
  id: string;
  carId: string;
  car: Car;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
