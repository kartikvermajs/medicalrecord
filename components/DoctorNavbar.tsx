"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  LogOut,
  Stethoscope,
  UserCircle2,
  Building2,
} from "lucide-react";

export function DoctorNavbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const doctorName = session?.user?.name || "Doctor";
  const doctorEmail = session?.user?.email || "";
  const initials = doctorName
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <nav className="w-full border-b border-border bg-background text-foreground shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-primary">MedVault</h1>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/doctor.png" alt={doctorName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="text-sm text-left leading-tight">
              <p className="font-medium text-foreground">{doctorName}</p>
              <p className="text-xs text-muted-foreground">{doctorEmail}</p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-2 flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className="sm:hidden">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {/* Doctor Info */}
              <div className="flex items-center gap-3 p-2 border-b border-border">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/doctor.png" alt={doctorName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{doctorName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {doctorEmail}
                  </p>
                </div>
              </div>

              {/* Profile */}
              <DropdownMenuItem className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-primary" />
                Profile
              </DropdownMenuItem>

              {/* Hospital */}
              <DropdownMenuItem className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                My Hospital
              </DropdownMenuItem>

              {/* Theme Toggle */}
              <DropdownMenuItem asChild>
                <div className="flex items-center justify-between">
                  <span>Theme</span>
                  <ThemeToggle />
                </div>
              </DropdownMenuItem>

              {/* Logout */}
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-destructive focus:text-destructive flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
