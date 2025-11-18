"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface LightboxProps {
  open: boolean;
  image: string | null;
  onClose: () => void;
}

export default function Lightbox({ open, image, onClose }: LightboxProps) {
  useEffect(() => {
    if (!open) return;

    const closeWithEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", closeWithEsc);
    return () => window.removeEventListener("keydown", closeWithEsc);
  }, [open, onClose]);

  if (!open || !image) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-4xl w-full h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={image} alt="Fullscreen" fill className="object-contain" />

        <button onClick={onClose} className="absolute top-4 right-4 text-white">
          <X className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
}
