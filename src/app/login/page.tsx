"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-stone-50 via-olive-50 to-green-50">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-olive-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-green-300 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Company Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png" // ← Replace with your actual logo path
            alt="Your Company Logo"
            width={140}
            height={140}
            className="drop-shadow-lg"
            priority
          />
        </div>

        <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-olive-200/50 dark:border-olive-800/50 overflow-hidden">
          <div className="px-8 pt-8 pb-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-olive-800 dark:text-olive-100">
                Welcome back
              </h1>
              <p className="mt-2 text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-olive-800 dark:text-olive-200 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-olive-300 dark:border-olive-700 bg-white/70 dark:bg-gray-800/70 focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-olive-800 dark:text-olive-200 font-medium">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-olive-600 hover:text-olive-700 dark:text-olive-400 hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-olive-300 dark:border-olive-700 bg-white/70 dark:bg-gray-800/70 focus:ring-2 focus:ring-olive-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-white font-semibold text-lg rounded-xl  hover:bg-olive-700 active:bg-olive-800 shadow-lg transform transition-all hover:scale-105 disabled:scale-100 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-olive-600 hover:text-olive-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}