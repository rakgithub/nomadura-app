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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Optional: redirect to a "check your email" page instead
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-stone-50 via-olive-50 to-green-50">
      {/* Subtle background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-olive-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-green-300 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Company Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"           // ← Your logo here (public/logo.png)
            alt="Company Logo"
            width={140}
            height={140}
            className="drop-shadow-lg"
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-olive-200/50 dark:border-olive-800/50 overflow-hidden">
          <div className="px-8 pt-8 pb-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-olive-800 dark:text-olive-100">
                Create your account
              </h1>
              <p className="mt-2 text-muted-foreground">
                Join us — it only takes a minute
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-olive-800 dark:text-olive-200 font-medium">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-xl border-olive-300 dark:border-olive-700 bg-white/70 dark:bg-gray-800/70 focus:ring-2 focus:ring-olive-500"
                  required
                />
              </div>

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
                  className="h-12 rounded-xl border-olive-300 dark:border-olive-700 bg-white/70 dark:bg-gray-800/70 focus:ring-2 focus:ring-olive-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-olive-800 dark:text-olive-200 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="h-12 rounded-xl border-olive-300 dark:border-olive-700 bg-white/70 dark:bg-gray-800/70 focus:ring-2 focus:ring-olive-500"
                  required
                />
              </div>

             {/* FIXED BUTTON – copy-paste this exact button */}
              <Button
                type="submit"
                disabled={loading}
                variant="default"                                         // important
                className="w-full h-12 text-lg font-semibold rounded-xl 
                          hover:bg-olive-700 active:bg-olive-800 
                          text-white                                      // forces white text
                          shadow-lg 
                          transition-all hover:scale-[1.02] 
                          disabled:opacity-70 disabled:cursor-not-allowed
                          disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
</Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-olive-600 hover:text-olive-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}