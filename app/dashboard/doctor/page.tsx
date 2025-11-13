"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DoctorNavbar } from "@/components/DoctorNavbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Mail,
  User,
  GraduationCap,
  Building2,
  Stethoscope,
} from "lucide-react";

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  const user = session?.user;

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-destructive">
        <p>No user session found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <DoctorNavbar />

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-primary">
          Welcome, Dr. {user.name?.split(" ")[0] || "Doctor"} 👨‍⚕️
        </h1>

        {/* Responsive Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Name Card */}
          <Card className="border border-border shadow-sm hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Name
              </CardTitle>
              <User className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{user.name}</p>
            </CardContent>
          </Card>

          {/* Email Card */}
          <Card className="border border-border shadow-sm hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Email
              </CardTitle>
              <Mail className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold break-all">{user.email}</p>
            </CardContent>
          </Card>

          {/* Qualification */}
          <Card className="border border-border shadow-sm hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Qualification
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {user.qualification || "Not provided"}
              </p>
            </CardContent>
          </Card>

          {/* Hospital */}
          <Card className="border border-border shadow-sm hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hospital
              </CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {user.hospital || "Not provided"}
              </p>
            </CardContent>
          </Card>

          {/* Field / Specialization */}
          <Card className="border border-border shadow-sm hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Field / Specialization
              </CardTitle>
              <Stethoscope className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {user.field || "Not specified"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Future section */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3 text-foreground">
            Upcoming Feature: Patient Management Dashboard 🧠
          </h2>
          <p className="text-muted-foreground">
            Soon you’ll be able to view, update, and upload patient records
            directly from this dashboard, powered by our AI-assisted analytics.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto text-center py-4 text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} MedVault · Empowering Healthcare
        Professionals
      </footer>
    </div>
  );
}
