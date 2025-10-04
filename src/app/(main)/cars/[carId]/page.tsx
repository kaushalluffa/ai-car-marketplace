import { retrieveVehicleDetails } from "@/app/actions/vehicle-operations";
import { notFound } from "next/navigation";
import { CarDetails } from "./car-details";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const { carId } = await params;
  const result = await retrieveVehicleDetails(carId);

  if (!result.success) {
    return {
      title: "Car Not Found | AutoVibe",
      description: "The requested car could not be found",
    };
  }

  const car = result.data;
  if (!car) {
    return {
      title: "Car Not Found | AutoVibe",
      description: "The requested car could not be found",
    };
  }

  return {
    title: `${car.year} ${car.make} ${car.model} | AutoVibe`,
    description: car?.description?.substring(0, 160),
    openGraph: {
      images: car.images?.[0] ? [car.images[0]] : [],
    },
  };
}

export default async function CarDetailsPage({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  // Fetch car details
  const { carId } = await params;
  const result = await retrieveVehicleDetails(carId);

  // If car not found, show 404
  if (!result.success || !result?.data?.id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <CarDetails
        car={result?.data}
        testDriveInfo={result?.data?.testDriveInfo}
      />
    </div>
  );
}
