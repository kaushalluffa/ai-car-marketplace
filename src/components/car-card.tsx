"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Car as CarIcon, Loader2, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Car } from "@/types";

export const CarCard = ({ car }: { car: Car & { wishlisted: boolean } }) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(car.wishlisted);
  const [isToggling, setIsToggling] = useState(false);

  // Handle save/unsave car
  const handleToggleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    try {
      const response = await fetch("/api/cars/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ carId: car.id }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSaved(result.saved);
        toast.success(result.message);
      } else {
        toast.error(result.error || "Failed to update favorites");
      }
    } catch (error) {
      console.error("Error toggling saved car:", error);
      toast.error("Failed to update favorites");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-0 shadow-lg bg-white rounded-2xl">
      <div className="relative h-56">
        {car.images && car.images.length > 0 ? (
          <div className="relative w-full h-full">
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover group-hover:scale-110 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <CarIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg ${
            isSaved
              ? "text-red-500 hover:text-red-600 bg-red-50/90"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={handleToggleSave}
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart className={isSaved ? "fill-current" : ""} size={20} />
          )}
        </Button>

        {car.featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col mb-4">
          <h3 className="text-xl font-bold line-clamp-1 text-gray-900 mb-1">
            {car.make} {car.model}
          </h3>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            ${car.price.toLocaleString()}
          </span>
        </div>

        <div className="text-gray-600 mb-4 flex items-center text-sm">
          <span className="font-medium">{car.year}</span>
          <span className="mx-2">•</span>
          <span>{car.transmission}</span>
          <span className="mx-2">•</span>
          <span>{car.fuelType}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            variant="outline"
            className="bg-purple-50 border-purple-200 text-purple-700"
          >
            {car.bodyType}
          </Badge>
          <Badge
            variant="outline"
            className="bg-indigo-50 border-indigo-200 text-indigo-700"
          >
            {car.mileage.toLocaleString()} mi
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-50 border-blue-200 text-blue-700"
          >
            {car.color}
          </Badge>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
          onClick={() => {
            router.push(`/cars/${car.id}`);
          }}
        >
          <Zap className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
