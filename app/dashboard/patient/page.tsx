"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserNavbar } from "@/components/UserNavbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, Hash, User } from "lucide-react";

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  if (status === "loading")
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );

  const user = session?.user;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <UserNavbar />

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-primary">
          Welcome, {user?.name?.split(" ")[0] || "Patient"} 👋
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
              <p className="text-lg font-semibold">{user?.name}</p>
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
              <p className="text-lg font-semibold break-all">{user?.email}</p>
            </CardContent>
          </Card>

          {/* Unique ID Card */}
          {user?.uniqueId && (
            <Card className="border border-border shadow-sm hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unique ID
                </CardTitle>
                <Hash className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {user.uniqueId}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Placeholder for future AI/chatbot section */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3 text-foreground">
            Coming Soon: AI Health Assistant 🤖
          </h2>
          <p className="text-muted-foreground">
            Our AI will analyze your medical records and provide insights,
            dietary advice, and follow-up recommendations.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto text-center py-4 text-sm text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} MedVault · Secure Medical Record System
      </footer>
    </div>
  );
}
