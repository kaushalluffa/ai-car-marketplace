import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { bodyTypes, carMakes, faqItems } from "@/lib/data";
import { SignedOut } from "@clerk/nextjs";
import {
  Award,
  Calendar,
  Car,
  ChevronRight,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";


export default async function Home() {
  const featuredCars = []

  return (
    <div className="flex flex-col pt-20">
      {/* Hero Section with Gradient Title */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-indigo-100/20 to-blue-100/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200/30 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-200/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-200/30 rounded-full blur-xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center px-4">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Car Discovery
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl mb-6 font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              AutoVibe
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-800 mb-6">
              Discover Your Perfect Ride
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Experience the future of car shopping with our AI-powered
              platform. Find, compare, and book test drives for thousands of
              vehicles with just a few clicks.
            </p>
          </div>

          {/* TODO: Search Component (Client) */}
          

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
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
      </section>

      {/* Featured Cars */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Handpicked Selection
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Vehicles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated collection of premium vehicles,
              each selected for their exceptional quality and value.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              asChild
            >
              <Link href="/cars">
                Explore All Vehicles <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* TODO: Featured Cars */}
          </div>
        </div>
      </section>

      {/* Browse by Make */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              Popular Brands
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse by Brand
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore vehicles from your favorite manufacturers and discover the
              perfect match for your lifestyle and preferences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {carMakes.map((make: typeof carMakes[number]) => (
              <Link
                key={make.name}
                href={`/cars?make=${make.name}`}
                className="group bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200 hover:-translate-y-1"
              >
                <div className="h-20 w-auto mx-auto mb-4 relative">
                  <Image
                    src={
                      make.image || `/make/${make.name.toLowerCase()}.webp`
                    }
                    alt={make.name}
                    fill
                    style={{ objectFit: "contain" }}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {make.name}
                </h3>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 mx-auto"
              asChild
            >
              <Link href="/cars">
                View All Brands <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Award className="w-4 h-4" />
              Why Choose AutoVibe
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Experience the Difference
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing car shopping with cutting-edge technology
              and exceptional service that puts you first.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Car className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Massive Selection
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Access thousands of verified vehicles from trusted dealerships
                and private sellers across the country.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Instant Booking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Book test drives instantly with our AI-powered scheduling
                system. No waiting, no hassle, just drive.
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Secure & Safe
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Every vehicle is verified and every transaction is protected.
                Your peace of mind is our priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Body Type */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Car className="w-4 h-4" />
              Vehicle Types
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Your Style
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're looking for a sleek sedan, rugged SUV, or sporty
              coupe, we have the perfect vehicle type to match your lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bodyTypes.map((type) => (
              <Link
                key={type.name}
                href={`/cars?bodyType=${type.name}`}
                className="relative group cursor-pointer"
              >
                <div className="overflow-hidden rounded-2xl h-32 mb-4 relative shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Image
                    src={
                      type.image || `/body/${type.name.toLowerCase()}.webp`
                    }
                    alt={type.name}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-2xl"></div>
                  <div className="absolute inset-0 flex items-end p-4">
                    <h3 className="text-white text-lg font-bold">
                      {type.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 mx-auto"
              asChild
            >
              <Link href="/cars">
                Explore All Types <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Got Questions?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about AutoVibe and our car discovery
              platform.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqItems.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-gray-200 rounded-2xl px-6 py-4 hover:border-purple-200 transition-colors"
                >
                  <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-indigo-600/90 to-blue-600/90"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Start Your Journey Today
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Find Your Perfect Ride?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied customers who discovered their dream
            vehicle through AutoVibe's AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
              asChild
            >
              <Link href="/cars">Explore Vehicles</Link>
            </Button>
            <SignedOut>
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-8 py-4 text-lg border-0 shadow-lg"
                asChild
              >
                <Link href="/sign-up">Get Started Free</Link>
              </Button>
            </SignedOut>
          </div>
        </div>
      </section>
    </div>
  );
}
