"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import * as z from "zod";
import {
  Calendar as CalendarIcon,
  Car,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { BookingDetails, Car as TCar, TestDriveInfo } from "@/lib/types";
import { scheduleDriveSession } from "@/app/actions/booking-management";

// ✅ Improved Zod schema with better validation messages
const testDriveSchema = z.object({
  date: z.date({ error: "Please select a date" }),
  timeSlot: z.string().min(1, "Please select a time slot"),
  notes: z.string().optional(),
});

type TestDriveFormValues = z.infer<typeof testDriveSchema>;

export function TestDriveForm({
  car,
  testDriveInfo,
}: {
  car: TCar;
  testDriveInfo: TestDriveInfo;
}) {
  const router = useRouter();

  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    { id: string; label: string; startTime: string; endTime: string }[]
  >([]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TestDriveFormValues>({
    resolver: zodResolver(testDriveSchema),
    defaultValues: {
      date: undefined,
      timeSlot: "",
      notes: "",
    },
  });

  const dealership = testDriveInfo?.dealership;
  const existingBookings = testDriveInfo?.userTestDrive;
  const selectedDate = watch("date");

  // ✅ UseCallback for stable function reference
  const isDayDisabled = useCallback(
    (day: Date) => {
      if (isBefore(startOfDay(day), startOfDay(new Date()))) return true;
      const dayOfWeek = format(day, "EEEE").toUpperCase();
      const schedule = dealership?.workingHours?.find(
        (d) => d.dayOfWeek === dayOfWeek
      );
      return !schedule || !schedule.isOpen;
    },
    [dealership?.workingHours]
  );

  // ✅ Simplified and efficient slot generation logic
  useEffect(() => {
    if (!selectedDate || !dealership?.workingHours) {
      setAvailableTimeSlots([]);
      return;
    }

    const selectedDay = format(selectedDate, "EEEE").toUpperCase();
    const schedule = dealership.workingHours.find(
      (d) => d.dayOfWeek === selectedDay
    );

    if (!schedule?.isOpen) {
      setAvailableTimeSlots([]);
      return;
    }

    const openHour = +schedule.openTime.split(":")[0];
    const closeHour = +schedule.closeTime.split(":")[0];

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const isBooked = (time: string) =>
      existingBookings?.bookingDate === formattedDate &&
      [existingBookings.startTime, existingBookings.endTime].includes(time);

    const slots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      const start = `${hour.toString().padStart(2, "0")}:00`;
      const end = `${(hour + 1).toString().padStart(2, "0")}:00`;
      if (!isBooked(start)) {
        slots.push({
          id: `${start}-${end}`,
          label: `${start} - ${end}`,
          startTime: start,
          endTime: end,
        });
      }
    }

    setAvailableTimeSlots(slots);
    setValue("timeSlot", ""); // clear old selection
  }, [selectedDate, dealership?.workingHours, existingBookings, setValue]);

  // ✅ Clean submit handler
  const onSubmit = async (data: TestDriveFormValues) => {
    const slot = availableTimeSlots.find((s) => s.id === data.timeSlot);
    if (!slot) return toast.error("Selected time slot is not available");

    setBookingInProgress(true);
    try {
      const result = await scheduleDriveSession(
        car.id,
        format(data.date, "yyyy-MM-dd"),
        slot.startTime,
        slot.endTime,
        data.notes || ""
      );

      if (result.success && result.data) {
        setBookingDetails({
          date: format(result.data.bookingDate, "EEEE, MMMM d, yyyy"),
          timeSlot: `${format(
            parseISO(`2022-01-01T${result.data.startTime}`),
            "h:mm a"
          )} - ${format(
            parseISO(`2022-01-01T${result.data.endTime}`),
            "h:mm a"
          )}`,
          notes: result.data.notes,
        });
        toast.success("Test drive booked successfully!");
        setShowConfirmation(true);
        reset();
      } else {
        toast.error(result.error || "Failed to book test drive. Try again.");
      }
    } catch (error) {
      console.error("Error booking test drive:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    router.push(`/cars/${car.id}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Car Details */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Car Details</h2>
            <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100">
              {car.images?.length ? (
                <img
                  src={car.images[0]}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Car className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold">
              {car.year} {car.make} {car.model}
            </h3>
            <div className="mt-2 text-xl font-bold text-blue-600">
              ${car.price.toLocaleString()}
            </div>

            <div className="mt-4 space-y-1 text-sm text-gray-600">
              {[
                ["Mileage", `${car.mileage.toLocaleString()} miles`],
                ["Fuel Type", car.fuelType],
                ["Transmission", car.transmission],
                ["Body Type", car.bodyType],
                ["Color", car.color],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between border-b last:border-none py-1"
                >
                  <span>{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dealership Info */}
        <Card>
          <CardContent className="p-6 text-sm">
            <h2 className="text-xl font-bold mb-4">Dealership Info</h2>
            <p className="font-medium">{dealership?.name || "Vehiql Motors"}</p>
            <p className="text-gray-600 mt-1">
              {dealership?.address || "Address not available"}
            </p>
            <p className="text-gray-600 mt-3">
              <span className="font-medium">Phone:</span>{" "}
              {dealership?.phone || "Not available"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span>{" "}
              {dealership?.email || "Not available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Form */}
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Schedule Your Test Drive</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select a Date
                </label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={isDayDisabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.date.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select a Time Slot
                </label>
                <Controller
                  name="timeSlot"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={
                          !selectedDate || availableTimeSlots.length === 0
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedDate
                                ? "Select a date first"
                                : availableTimeSlots.length === 0
                                ? "No slots available"
                                : "Select a time slot"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.timeSlot && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.timeSlot.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Any specific requests for your test drive?"
                      className="min-h-24"
                    />
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={bookingInProgress}
              >
                {bookingInProgress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking Your Test Drive...
                  </>
                ) : (
                  "Book Test Drive"
                )}
              </Button>
            </form>

            <div className="mt-8 bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-2">
              <h3 className="font-medium text-gray-900">What to expect</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Bring your driver’s license for verification
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  Test drives usually last 30–60 minutes
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  A dealership representative will accompany you
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Test Drive Booked Successfully
            </DialogTitle>
            <DialogDescription>
              Your test drive has been confirmed with the following details:
            </DialogDescription>
          </DialogHeader>

          {bookingDetails && (
            <div className="py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Car:</span>
                <span>
                  {car.year} {car.make} {car.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{bookingDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time Slot:</span>
                <span>{bookingDetails.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Dealership:</span>
                <span>{dealership?.name || "Vehiql Motors"}</span>
              </div>

              <div className="mt-4 bg-blue-50 p-3 rounded text-blue-700">
                Please arrive 10 minutes early with your driver’s license.
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleCloseConfirmation}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
