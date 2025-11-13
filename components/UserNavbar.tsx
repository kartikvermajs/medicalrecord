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
import { Menu } from "lucide-react";

export function UserNavbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <nav className="w-full border-b border-border bg-background text-foreground shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3">
        {/* Brand */}
        <h1 className="text-xl font-bold text-primary">MedVault</h1>

        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/user.png" alt={userName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="text-sm text-left leading-tight">
              <p className="font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-2"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="sm:hidden">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 p-2 border-b border-border">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/user.png" alt={userName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userEmail}
                  </p>
                </div>
              </div>

              <DropdownMenuItem asChild>
                <div className="flex items-center justify-between">
                  <span>Theme</span>
                  <ThemeToggle />
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-destructive focus:text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
