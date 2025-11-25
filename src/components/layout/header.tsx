"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="md:hidden w-10" /> {/* Spacer for mobile menu button */}

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user?.email}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
