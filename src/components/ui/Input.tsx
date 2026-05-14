import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "onDark" | "error"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[48px] w-full bg-transparent px-3 py-2 text-[14px] transition-all placeholder:text-gray-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "border-b border-white/10 text-white font-sans tracking-[0.03em]",
          variant === "onDark" && "bg-[#1a1a1a] border border-white/10 focus:border-[var(--accent)] focus:bg-[#222] rounded-sm px-4",
          variant === "error" && "border-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
