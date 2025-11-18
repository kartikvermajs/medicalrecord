"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThemeToggle } from "@/components/ThemeToggle";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/Loader";

const formSchema = z.object({
  role: z.string().refine((v) => v === "doctor" || v === "patient", {
    message: "Please select a role",
  }),

  name: z.string().min(1, "Name is required"),

  email: z.string().min(1, "Email is required").email("Enter a valid email"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),

  gender: z.string().min(1, "Please select gender"),

  dob: z.string().min(1, "Date of Birth is required"),

  age: z.number().optional(),

  qualification: z.string().optional(),
  hospital: z.string().optional(),
  field: z.string().optional(),
});

type RegisterData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "patient",
      name: "",
      email: "",
      password: "",
      gender: "",
      dob: "",
      age: undefined,
      qualification: "",
      hospital: "",
      field: "",
    },
  });

  const role = form.watch("role");
  const dob = form.watch("dob");

  // AGE CALCULATION
  useEffect(() => {
    if (!dob) return;

    const birth = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    if (age >= 0 && form.getValues("age") !== age) {
      form.setValue("age", age);
    }
  }, [dob, form]);

  // SUBMIT HANDLER
  const onSubmit = async (data: RegisterData) => {
    setMsg("");
    setLoading(true);

    try {
      console.log("🔍 Sending Register Payload:", data);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      console.log("🔍 Server Response:", json);

      setMsg(json.error || json.message || "Unknown response");
    } catch (err) {
      console.error("⚠️ Registration Error:", err);
      setMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-md border border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-foreground">
            Register at MedVault
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* ROLE */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NAME */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* EMAIL */}
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="you@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PASSWORD */}
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* GENDER */}
              <FormField
                name="gender"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DOB + AGE */}
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <FormField
                  name="dob"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="age"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          readOnly
                          value={field.value ?? ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* DOCTOR FIELDS */}
              {role === "doctor" && (
                <>
                  <FormField
                    name="qualification"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="MBBS, MD…" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="hospital"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Hospital Name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="field"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Cardiology, Neurology…"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button
                disabled={loading}
                type="submit"
                className="w-full flex items-center justify-center gap-2"
              >
                {loading && <Loader size={18} thickness={2} />}
                {loading ? "Submitting..." : "Register"}
              </Button>

              {msg && (
                <p
                  className={`text-sm text-center ${
                    msg.toLowerCase().includes("error")
                      ? "text-destructive"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {msg}
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
