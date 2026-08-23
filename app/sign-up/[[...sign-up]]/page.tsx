import React from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { VXNLogo } from "@/components/Header";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between font-sans selection:bg-[#E64A19] selection:text-white px-4 py-8">
      {/* Top Bar */}
      <div className="max-w-[1280px] w-full mx-auto flex items-center justify-between">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <VXNLogo size="sm" />
        </Link>
        <Link
          href="/"
          className="text-xs text-[#9E9E9E] hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Main Centered Sign-Up Card */}
      <div className="w-full flex flex-col items-center justify-center my-8">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/"
        />
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#616161]">
        vibeXnews • Data-driven clarity • Stay consistent. Stay un-biased.
      </div>
    </div>
  );
}
