"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DoctorNavbar } from "@/components/DoctorNavbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Mail,
  User,
  GraduationCap,
  Building2,
  Stethoscope,
} from "lucide-react";
import DoctorPatientPage from "./DoctorPatientPage";
import DoctorTreatedList from "./DoctorTreatedList";
import axios from "axios";
import Loader from "@/components/Loader";

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [treated, setTreated] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const user = session?.user;

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/doctor/${user.id}/treated`);
        setTreated(res.data?.records || []);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [user?.id]);

  if (status === "loading")
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size={30} />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <DoctorNavbar />

      <main className="flex-1 w-full px-4 sm:px-8 py-6">
        <h1 className="text-3xl font-bold mb-6 text-primary">
          Welcome, Dr. {user?.name?.split(" ")[0]}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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

          <Card className="border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Qualification
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {user?.qualification || "Not provided"}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Hospital
              </CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {user?.hospital || "Not provided"}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Specialization
              </CardTitle>
              <Stethoscope className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {user?.field || "Not specified"}
              </p>
            </CardContent>
          </Card>
        </div>

        <DoctorPatientPage />

        <DoctorTreatedList loading={loading} records={treated} />
      </main>
    </div>
  );
}
