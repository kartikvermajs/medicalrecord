"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, Stethoscope } from "lucide-react";
import Image from "next/image";
import Loader from "@/components/Loader";

export interface CheckupRecord {
  id: string;
  recordType: string;
  createdAt: string;
  data: {
    subject: string;
    images: string[];
  };
}

interface Props {
  loading: boolean;
  records: CheckupRecord[];
}

export default function CheckupDetails({ loading, records }: Props) {
  if (loading)
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader size={22} />
        Loading checkups...
      </div>
    );

  if (records.length === 0)
    return <p className="text-muted-foreground">No checkups recorded yet.</p>;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-primary" />
        Recent Checkups
      </h2>

      <div className="space-y-6">
        {records.map((record) => (
          <Card key={record.id} className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {record.recordType}
                </span>
                <span className="text-sm flex items-center gap-1 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(record.createdAt).toLocaleDateString()}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {record.data.images?.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {record.data.images.map((src) => (
                    <div
                      key={src}
                      className="relative w-24 h-24 rounded border overflow-hidden"
                    >
                      <Image
                        src={src}
                        alt="Record Image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
