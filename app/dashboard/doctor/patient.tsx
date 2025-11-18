"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, UserPlus, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";

interface Patient {
  id: string;
  name: string;
  email: string;
  uniqueId: string;
  age?: number;
  gender?: string;
}

export default function DoctorPatientPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [connecting, setConnecting] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [connectedPatient, setConnectedPatient] = useState<Patient | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="animate-spin h-6 w-6 text-primary mr-2" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const handleConnect = async () => {
    if (!uniqueId.trim()) {
      alert("Please enter a valid unique ID");
      return;
    }

    setConnecting(true);
    try {
      const res = await axios.get<{ patient: Patient | null }>(
        `/api/patient/${uniqueId}`
      );
      if (res.data?.patient) {
        setConnectedPatient(res.data.patient);
      } else {
        alert("No patient found with that ID.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to patient.");
    } finally {
      setConnecting(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );

    try {
      const res = await axios.post<{ secure_url: string }>(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      setImages((prev) => [...prev, res.data.secure_url]);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check Cloudinary config.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim() || images.length === 0) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/patient/update", {
        uniqueId,
        subject,
        images,
        doctorId: session?.user?.id,
      });
      alert("Details saved successfully!");
      setSubject("");
      setImages([]);
    } catch (error) {
      console.error(error);
      alert("Failed to save patient details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 ml-[-20] text-primary">
          Patient Management 🩺
        </h1>

        {!connectedPatient ? (
          <Card className="max-w-md mx-auto p-6 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Connect with a Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter Patient Unique ID"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
              />
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full"
              >
                {connecting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Connecting...
                  </>
                ) : (
                  "Connect Patient"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Connected to {connectedPatient.name} (
                  {connectedPatient.uniqueId})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter checkup subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                <div className="relative border-2 border-dashed p-4 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary transition">
                  <FileImage className="h-6 w-6 mb-2" />
                  <p className="text-sm">
                    Drag & drop or click to upload checkup image
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="opacity-0 absolute inset-0 cursor-pointer"
                  />
                </div>

                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Uploading...
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {images.map((url) => (
                    <div
                      key={url}
                      className="relative w-24 h-24 border rounded-md overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt="Uploaded"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" /> Save Checkup
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
