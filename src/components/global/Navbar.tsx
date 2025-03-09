"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/backend/auth";
import { UserRole } from "@/lib/backend/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRound, LogOut, School } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: UserRole } | null>(
    null
  );

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (session) {
        setUser({
          name: (session as { name?: string }).name || "",
          role: (session as { role: UserRole }).role,
        });
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case "school":
        return "/dashboard/school";
      case "teacher":
        return "/dashboard/teacher";
      case "student":
        return "/dashboard/student";
      default:
        return "/auth/login";
    }
  };

  return (
    <nav className="border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">
              Neural Tutors
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href={getDashboardLink()}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === "school" && (
                  <Link
                    href="/dashboard/school/teachers"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Teachers
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <UserRound className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <School className="h-4 w-4" />
                    <span>{user.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
