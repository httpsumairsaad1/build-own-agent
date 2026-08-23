"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VXNLogo } from "@/components/Header";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Clerk authentication is ready. Connect your Clerk publishable key to activate live sessions.");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between font-sans selection:bg-[#E64A19] selection:text-white px-4 py-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1E1E1E] text-[#FF9800] border border-[#FF9800]/40 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 text-sm animate-fade-in">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Back Link */}
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

      {/* Main Sign-In Card */}
      <div className="w-full max-w-md mx-auto my-12 bg-[#1E1E1E] rounded-2xl border border-[#2C2C2C] p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <VXNLogo size="lg" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Welcome to vibeXnews
          </h1>
          <p className="text-xs text-[#9E9E9E]">
            Sign in to unlock personalized perspective audits, saved articles, and custom bias alerts.
          </p>
        </div>

        {/* Social Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => showToast("Google OAuth ready for Clerk provider.")}
            className="w-full py-2.5 px-4 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] rounded-lg text-xs font-semibold text-[#E0E0E0] transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => showToast("GitHub OAuth ready for Clerk provider.")}
            className="w-full py-2.5 px-4 bg-[#141414] hover:bg-[#252525] border border-[#2C2C2C] rounded-lg text-xs font-semibold text-[#E0E0E0] transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2C2C2C]" />
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#757575]">
            or with email
          </span>
          <div className="flex-1 h-px bg-[#2C2C2C]" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#BDBDBD]">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white placeholder-[#757575] border border-[#2C2C2C] rounded-lg focus:outline-none focus:border-[#E64A19] focus:ring-1 focus:ring-[#E64A19] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#BDBDBD]">Password</label>
              <button
                type="button"
                onClick={() => showToast("Password reset ready for Clerk setup.")}
                className="text-[11px] text-[#FF9800] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-xs bg-[#141414] text-white placeholder-[#757575] border border-[#2C2C2C] rounded-lg focus:outline-none focus:border-[#E64A19] focus:ring-1 focus:ring-[#E64A19] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-[#D32F2F] via-[#E64A19] to-[#FF9800] hover:opacity-95 rounded-lg shadow-lg transition-all"
          >
            Sign In to vibeXnews
          </button>
        </form>

        {/* Footer info */}
        <p className="text-center text-[11px] text-[#757575]">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => showToast("Sign up flow ready for Clerk registration.")}
            className="text-[#FF9800] font-semibold hover:underline"
          >
            Create one free
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#616161]">
        vibeXnews • Data-driven clarity • Stay consistent. Stay un-biased.
      </div>
    </div>
  );
}
