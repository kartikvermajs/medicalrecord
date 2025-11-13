import NextAuth, { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";

// Explicit database user types
interface DoctorRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  qualification?: string | null;
  hospital?: string | null;
  field?: string | null;
}

interface PatientRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  uniqueId: string;
}

// Type-safe unified user object
interface CustomUser extends User {
  id: string;
  name: string;
  email: string;
  role: "doctor" | "patient";
  uniqueId?: string | null;
  qualification?: string | null;
  hospital?: string | null;
  field?: string | null;
}

// Extend NextAuth Session + JWT
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "doctor" | "patient";
      uniqueId?: string | null;
      qualification?: string | null;
      hospital?: string | null;
      field?: string | null;
    };
    role: "doctor" | "patient";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "doctor" | "patient";
    uniqueId?: string | null;
    qualification?: string | null;
    hospital?: string | null;
    field?: string | null;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials.password || !credentials.role) {
          throw new Error("Missing credentials");
        }

        const { email, password, role } = credentials;

        if (role === "doctor") {
          const doctor = await prisma.doctor.findUnique({ where: { email } });
          if (!doctor) throw new Error("No doctor found");

          const valid = await bcrypt.compare(password, doctor.password);
          if (!valid) throw new Error("Invalid password");

          return {
            id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            role: "doctor",
            qualification: doctor.qualification ?? null,
            hospital: doctor.hospital ?? null,
            field: doctor.field ?? null,
          };
        }

        // Patient case
        const patient = await prisma.patient.findUnique({ where: { email } });
        if (!patient) throw new Error("No patient found");

        const valid = await bcrypt.compare(password, patient.password);
        if (!valid) throw new Error("Invalid password");

        return {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          role: "patient",
          uniqueId: patient.uniqueId ?? null,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
  },

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        const u = user as CustomUser;
        token.id = u.id;
        token.role = u.role;
        token.uniqueId = u.uniqueId ?? null;
        token.qualification = u.qualification ?? null;
        token.hospital = u.hospital ?? null;
        token.field = u.field ?? null;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      session.user = {
        id: token.id,
        name: session.user?.name ?? "",
        email: session.user?.email ?? "",
        role: token.role,
        uniqueId: token.uniqueId ?? null,
        qualification: token.qualification ?? null,
        hospital: token.hospital ?? null,
        field: token.field ?? null,
      };
      session.role = token.role;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
