import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AutoVibe",
  description: "Discover Your Perfect Ride with AI-Powered Car Discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#7c3aed", // purple-600
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#1f2937",
        },
        elements: {
          formButtonPrimary:
            "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold",
          card: "shadow-xl border-0 rounded-2xl",
          headerTitle: "text-gray-900 font-bold",
          headerSubtitle: "text-gray-600",
          socialButtonsBlockButton: "border-gray-200 hover:border-purple-300",
          footerActionLink: "text-purple-600 hover:text-purple-700",
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <footer className="bg-gradient-to-r from-purple-50 to-indigo-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made by AutoVibe Team</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
