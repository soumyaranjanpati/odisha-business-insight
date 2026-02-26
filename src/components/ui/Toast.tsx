"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error";

export function Toast({
  message,
  type,
  onDismiss,
  duration = 3000,
}: {
  message: string;
  type: ToastType;
  onDismiss: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <div
      role="alert"
      className={cn(
        "fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg",
        type === "success" && "bg-green-600 text-white",
        type === "error" && "bg-red-600 text-white"
      )}
    >
      {message}
    </div>
  );
}
