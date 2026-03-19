"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "theme";
  size?: "default" | "sm";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        size === "default" && "px-5 py-2.5",
        size === "sm" && "px-3.5 py-2",
        variant === "default" && "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20",
        variant === "theme" &&
          "theme-btn-fill text-white focus:outline-none focus:ring-2 focus:ring-[var(--theme-ring)]/40",
        variant === "outline" && "border border-zinc-200 bg-white hover:bg-zinc-50 focus:ring-2 focus:ring-zinc-300/40",
        variant === "ghost" && "hover:bg-zinc-100",
        className,
      )}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    />
  );
}
