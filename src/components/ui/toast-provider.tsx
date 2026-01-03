"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#1A1A1A",
          color: "#FFFFFF",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        classNames: {
          toast: "font-sans",
          title: "text-sm font-medium",
          description: "text-xs text-white/60",
          actionButton: "bg-white text-black text-xs font-medium",
          cancelButton: "bg-white/10 text-white text-xs",
          success: "border-green-500/30",
          error: "border-red-500/30",
          warning: "border-yellow-500/30",
          info: "border-blue-500/30",
        },
      }}
      expand={false}
      richColors
      closeButton
    />
  );
}

export { toast } from "sonner";
