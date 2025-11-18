"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, User, Maximize2 } from "lucide-react";
import Loader from "@/components/Loader";
import Image from "next/image";
import Lightbox from "@/components/Lightbox";

interface TreatedRecord {
  id: string;
  recordType: string;
  createdAt: string;
  data?: {
    images?: string[];
  };
  patient: {
    name: string;
    uniqueId: string;
  };
}

interface Props {
  loading: boolean;
  records: TreatedRecord[];
}

export default function DoctorTreatedList({ loading, records }: Props) {
  const [fullscreen, setFullscreen] = useState<string | null>(null);

  if (loading)
    return (
      <div className="flex gap-2 items-center mt-10">
        <Loader size={22} />
        Loading treated patients...
      </div>
    );

  if (records.length === 0)
    return (
      <p className="mt-10 text-muted-foreground">No treated patients yet.</p>
    );

  return (
    <>
      <Lightbox
        open={!!fullscreen}
        image={fullscreen}
        onClose={() => setFullscreen(null)}
      />

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Patients Treated</h2>

        <div className="space-y-4">
          {records.map((r) => (
            <Card key={r.id} className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{r.recordType}</span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="text-sm space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {r.patient.name}
                </div>

                <p className="text-blue-600 dark:text-blue-400">
                  {r.patient.uniqueId}
                </p>

                {r.data?.images && r.data.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {r.data.images.map((img) => (
                      <button
                        key={img}
                        type="button"
                        className="relative w-24 h-24 rounded-md overflow-hidden border group outline-none"
                        onClick={() => setFullscreen(img)}
                      >
                        <Image
                          src={img}
                          alt="Record Image"
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-cover"
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Maximize2 className="text-white h-5 w-5" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
