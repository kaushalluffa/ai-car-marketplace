"use client";

import { useState, useEffect } from "react";
import { Search, Upload, Camera, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { processVehicleImageWithAI } from "@/app/actions/smart-search";
export function HomeSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchImage, setSearchImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<FileReader["result"]>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isImageSearchActive, setIsImageSearchActive] =
    useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Handle image upload with react-dropzone
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setIsUploading(true);
      setSearchImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to read the image");
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      maxFiles: 1,
    });

  // Handle text search submissions
  const handleTextSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    router.push(`/cars?search=${encodeURIComponent(searchTerm)}`);
  };

  // Handle image search submissions
  const handleImageSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchImage) {
      toast.error("Please upload an image first");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processVehicleImageWithAI(searchImage);
      console.log("AI Search Result:", result);
      if (result.success) {
        const params = new URLSearchParams();

        // Add extracted params to the search
        if (result?.data?.make) params.set("make", result?.data?.make);
        if (result?.data?.bodyType)
          params.set("bodyType", result?.data?.bodyType);
        if (result?.data?.color) params.set("color", result?.data?.color);

        // Redirect to search results
        router.push(`/cars?${params.toString()}`);
      } else {
        toast.error(
          "Failed to analyze image: " + (result.error || "Unknown error")
        );
      }
    } catch (error: any) {
      console.error("Error processing image:", error);
      toast.error("Failed to analyze image: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleTextSearch}>
        <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="absolute left-4 z-10">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search by make, model, or try our AI Image Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 pr-32 py-6 w-full text-lg border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-gray-400"
          />

          {/* Image Search Button */}
          <div className="absolute right-24 z-10">
            <button
              type="button"
              onClick={() => setIsImageSearchActive(!isImageSearchActive)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isImageSearchActive
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Camera size={24} />
            </button>
          </div>

          <Button
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg font-semibold px-6"
          >
            <Zap className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </form>

      {isImageSearchActive && (
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI Image Search
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload a Car Image
            </h3>
            <p className="text-gray-600">
              Our AI will analyze the image and find similar vehicles for you
            </p>
          </div>

          <form onSubmit={handleImageSearch} className="space-y-6">
            <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center bg-gradient-to-br from-purple-50 to-indigo-50">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview as string}
                    alt="Car preview"
                    className="h-48 object-contain mb-6 rounded-xl shadow-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                      toast.info("Image removed");
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-2xl mb-4">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-700 mb-2 font-medium">
                      {isDragActive && !isDragReject
                        ? "Drop the image here"
                        : "Drag & drop a car image or click to select"}
                    </p>
                    {isDragReject && (
                      <p className="text-red-500 mb-2 font-medium">
                        Invalid image type
                      </p>
                    )}
                    <p className="text-gray-500 text-sm">
                      Supports: JPG, PNG (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {imagePreview && (
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 text-lg shadow-lg"
                disabled={isUploading || isProcessing}
              >
                {isUploading ? (
                  <>
                    <Upload className="w-5 h-5 mr-2 animate-bounce" />
                    Uploading...
                  </>
                ) : isProcessing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing image...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Find Similar Cars
                  </>
                )}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
