"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChatFab() {
  const router = useRouter();

  return (
    <button
      aria-label="Open AI Chat"
      onClick={() => router.push("/dashboard/patient/chat")}
      className="
        fixed bottom-6 right-6 z-9999
        h-16 w-16 rounded-full 
        bg-primary text-primary-foreground
        flex items-center justify-center
        shadow-xl hover:shadow-2xl
        transition-all duration-300
        animate-[pulse_2.5s_ease-in-out_infinite]
      "
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
}
