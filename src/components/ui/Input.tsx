import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs uppercase tracking-wider text-secondary-text font-medium flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-amber text-[10px]">* REQUIRED</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full bg-[#101317] border border-hairline px-4 py-3 text-primary-text placeholder:text-muted text-sm rounded-none focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors duration-150 disabled:opacity-50",
            error && "border-red-500/80 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-[11px] text-muted">{hint}</p>}
        {error && <p className="text-[11px] text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
