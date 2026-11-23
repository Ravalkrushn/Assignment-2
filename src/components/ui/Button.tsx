import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-amber text-[#0A0C0E] hover:bg-amber-hover font-semibold shadow-sm active:scale-[0.98]":
              variant === "primary",
            "bg-[#101317] text-primary-text border border-hairline hover:border-amber/50 hover:bg-[#161a20]":
              variant === "secondary",
            "border border-hairline bg-transparent text-primary-text hover:border-primary-text/40 hover:bg-white/[0.02]":
              variant === "outline",
            "bg-transparent text-secondary-text hover:text-primary-text hover:bg-white/[0.04]":
              variant === "ghost",
            "px-3 py-1.5 text-xs tracking-wider uppercase": size === "sm",
            "px-6 py-3 text-sm tracking-wide": size === "md",
            "px-8 py-4 text-base tracking-wide": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
