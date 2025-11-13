// /types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "doctor" | "patient";
      qualification?: string | null;
      hospital?: string | null;
      field?: string | null;
      uniqueId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: "doctor" | "patient";
    qualification?: string | null;
    hospital?: string | null;
    field?: string | null;
    uniqueId?: string | null;
  }
}
