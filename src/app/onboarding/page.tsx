import { ensureUserInDatabase } from "@/lib/userSync";
import { Button } from "@/components/ui/button";
import { CheckCircle, Car, Heart, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function OnboardingPage() {
  // Ensure user is created in database
  const { user, error } = await ensureUserInDatabase();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Setup Error</h1>
          <p className="text-gray-600 mb-6">
            There was an issue setting up your account.
          </p>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pt-5">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Welcome Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full text-lg font-medium mb-6">
              <Sparkles className="w-5 h-5" />
              Welcome to AutoVibe!
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome, {user?.name || "Car Enthusiast"}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your account has been successfully created. You're now ready to
              discover amazing cars and book test drives with our AI-powered
              platform.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Browse Cars
              </h3>
              <p className="text-gray-600">
                Explore thousands of verified vehicles with advanced filtering
                and AI-powered search.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Save Favorites
              </h3>
              <p className="text-gray-600">
                Save cars you love and compare them easily. Build your dream car
                collection.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Book Test Drives
              </h3>
              <p className="text-gray-600">
                Schedule test drives instantly with our AI-powered booking
                system.
              </p>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Account Setup Complete
              </h2>
            </div>
            <div className="text-left max-w-md mx-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-semibold capitalize">{user?.role}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg"
              asChild
            >
              <Link href="/cars">
                <Car className="mr-2 h-5 w-5" />
                Start Browsing Cars
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg"
              asChild
            >
              <Link href="/">
                <Sparkles className="mr-2 h-5 w-5" />
                Go to Homepage
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                10K+
              </div>
              <div className="text-sm text-gray-600">Cars Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                50K+
              </div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">99%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                24/7
              </div>
              <div className="text-sm text-gray-600">AI Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
