"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Upload, UserPlus, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";
import Loader from "@/components/Loader";

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

  const [uniqueId, setUniqueId] = useState("");
  const [connectedPatient, setConnectedPatient] = useState<Patient | null>(
    null
  );
  const [connecting, setConnecting] = useState(false);

  const [subject, setSubject] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Loader size={30} />
      </div>
    );
  }

  const connectPatient = async () => {
    if (!uniqueId.trim()) return;
    setConnecting(true);

    console.log("🔎 Connecting patient with ID:", uniqueId);

    try {
      const res = await axios.get(`/api/patient/${uniqueId}`);
      console.log("📌 Patient lookup response:", res.data);

      if (res.data?.patient) {
        setConnectedPatient(res.data.patient);
        console.log("✅ Patient connected:", res.data.patient);
      } else {
        console.log("❌ No patient found");
      }
    } catch (err) {
      console.error("❌ Patient lookup failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    console.log("📤 Uploading image:", file.name);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      console.log("☁️ Cloudinary upload success:", res.data.secure_url);

      setImages((prev) => [...prev, res.data.secure_url]);
    } catch (err) {
      console.error("❌ Cloudinary upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const saveRecord = async () => {
    console.log("💾 Saving record...");

    if (!subject.trim() || !connectedPatient) {
      console.log("⚠️ Missing subject or patient — aborting save");
      return;
    }

    console.log("📦 Record payload:", {
      subject,
      images,
      patient: connectedPatient.uniqueId,
      doctorId: session?.user?.id,
    });

    setSaving(true);

    let analysis = null;

    try {
      if (images.length > 0) {
        console.log("🧠 Sending first image to AI:", images[0]);

        const aiRes = await axios.post("/api/ai/analyze-image", {
          imageUrl: images[0],
          subject,
        });

        console.log("🤖 AI analysis response:", aiRes.data);

        analysis = aiRes.data?.analysis || null;
      } else {
        console.log("ℹ️ No images uploaded — skipping AI analysis");
      }
    } catch (err) {
      console.error("❌ AI analysis failed:", err);
    }

    try {
      console.log("📩 Sending final save request to backend...");

      const saveRes = await axios.post("/api/patient/update", {
        uniqueId: connectedPatient.uniqueId,
        subject,
        images,
        doctorId: session?.user?.id,
        analysis,
      });

      console.log("✅ Record saved:", saveRes.data);

      setSubject("");
      setImages([]);
    } catch (err) {
      console.error("❌ Saving record failed:", err);
      alert("Saving failed — check console for errors.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col bg-background text-foreground">
      <main className="flex-1 p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-primary">
          Patient Management
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
                onClick={connectPatient}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2"
              >
                {connecting ? <Loader size={20} /> : "Connect Patient"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
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

                <div className="relative border-2 border-dashed p-4 rounded-lg text-muted-foreground flex flex-col items-center justify-center">
                  <FileImage className="h-6 w-6 mb-2" />
                  <p className="text-sm">Upload a checkup image (optional)</p>

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="opacity-0 absolute inset-0 cursor-pointer"
                  />
                </div>

                {uploading && <Loader size={22} />}

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
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={saveRecord}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader size={20} />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Checkup"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
