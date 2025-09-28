import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center w-full">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join AutoVibe
          </h1>
          <p className="text-gray-600">
            Create your account and start discovering amazing cars
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-2xl border-0 rounded-2xl",
              headerTitle: "text-gray-900 font-bold",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton:
                "border-gray-200 hover:border-purple-300",
              formButtonPrimary:
                "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
              footerActionLink: "text-purple-600 hover:text-purple-700",
            },
          }}
        />
      </div>
    </div>
  );
}
