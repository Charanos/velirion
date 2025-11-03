"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl shadow-black/40",
          title: "font-heading text-white font-medium",
          description: "font-body text-white/70",
          success:
            "border-emerald-400/30 bg-emerald-500/10 shadow-emerald-900/30",
          error: "border-rose-400/30 bg-rose-500/10 shadow-rose-900/30",
          warning: "border-amber-400/30 bg-amber-500/10 shadow-amber-900/30",
          info: "border-indigo-400/30 bg-indigo-500/10 shadow-indigo-900/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
