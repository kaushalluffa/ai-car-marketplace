import { ensureUserInDatabase } from "@/lib/userSync";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowLeft, CarFront, Heart, Layout, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export const Header = async ({ isAdminPage = false }) => {
  const { user } = await ensureUserInDatabase();
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="fixed top-0 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 backdrop-blur-md z-50 border-b border-purple-200/20 shadow-lg">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={isAdminPage ? "/admin" : "/"} className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold">AutoVibe</h1>
              <p className="text-xs text-purple-100">AI Car Discovery</p>
            </div>
          </div>
          {isAdminPage && (
            <span className="text-xs font-extralight text-purple-200 bg-white/10 px-2 py-1 rounded">admin</span>
          )}
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {isAdminPage ? (
            <>
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <ArrowLeft size={18} />
                  <span>Back to App</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              {/* All Vehicles Button - Always visible */}
              <Link href="/cars">
                <Button variant="outline" className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <CarFront size={18} />
                  <span className="hidden md:inline">All Vehicles</span>
                </Button>
              </Link>
              
              <SignedIn>
                {!isAdmin && (
                  <Link href="/reservations">
                    <Button variant="outline" className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <CarFront size={18} />
                      <span className="hidden md:inline">My Bookings</span>
                    </Button>
                  </Link>
                )}
                <a href="/saved-cars">
                  <Button className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 shadow-lg">
                    <Heart size={18} />
                    <span className="hidden md:inline">Favorites</span>
                  </Button>
                </a>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Layout size={18} />
                      <span className="hidden md:inline">Admin Portal</span>
                    </Button>
                  </Link>
                )}
              </SignedIn>
            </>
          )}

          <SignedOut>
            {!isAdminPage && (
              <SignInButton forceRedirectUrl="/">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Get Started
                </Button>
              </SignInButton>
            )}
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 border-2 border-white/20",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
