import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 bg-background text-center">
      {/* Make main relative so absolute children position correctly */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to MedVault
        </h1>
        <p className="text-lg text-muted-foreground">
          Your lifetime medical record system — secure, cloud-based, and powered
          by AI for health insights. Doctors can upload records, patients can
          view them, and our AI can analyze your reports instantly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition"
          >
            Register
          </Link>
        </div>
      </div>

      <footer className="mt-20 text-sm text-muted-foreground">
        © {new Date().getFullYear()} MedVault · Secure Medical Record System
      </footer>
    </main>
  );
}
