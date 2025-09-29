import { apiRoutesMap } from "@/lib/apiRoutesMap";
import { CarFilters } from "./car-filters";

export const metadata = {
  title: "Cars | Vehiql",
  description: "Browse and search for your dream car",
};

async function getCarFilters() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${
        apiRoutesMap.v1.cars.filters
      }`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch car filters");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching car filters:", error);
    return { success: false, data: null };
  }
}

export default async function CarsPage() {
  // Fetch filters data on the server
    const filtersData = await getCarFilters();
    console.log(filtersData)

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-4 gradient-title">Browse Cars</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <CarFilters filters={filtersData.data} />
        </div>

        {/* Car Listings */}
        <div className="flex-1">
          {/* TODO: Implement CarListings component */}
        </div>
      </div>
    </div>
  );
}
