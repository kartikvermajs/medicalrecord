"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserNavbar } from "@/components/UserNavbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, Hash, User } from "lucide-react";
import axios from "axios";
import Loader from "@/components/Loader";
import CheckupDetails, { CheckupRecord } from "./CheckupDetails";
import ChatFab from "@/components/ChatFab";
import Lightbox from "@/components/Lightbox";

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [records, setRecords] = useState<CheckupRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const user = session?.user;

  useEffect(() => {
    const load = async () => {
      if (!user?.uniqueId) return;

      setLoading(true);
      try {
        const res = await axios.get(`/api/patient/${user.uniqueId}`);
        setRecords(res.data?.patient?.records || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.uniqueId]);

  if (status === "loading")
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Loader size={30} />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <UserNavbar />

      <main className="flex-1 w-full px-4 sm:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-primary">
          Welcome, {user?.name?.split(" ")[0]} 👋
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Name
              </CardTitle>
              <User className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{user?.name}</p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Email
              </CardTitle>
              <Mail className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold break-all">{user?.email}</p>
            </CardContent>
          </Card>

          {user?.uniqueId && (
            <Card className="border border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">
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

        <CheckupDetails loading={loading} records={records} />
      </main>

      <ChatFab />
    </div>
  );
}
