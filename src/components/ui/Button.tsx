import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 uppercase tracking-[1.8px] font-heading font-normal",
  {
    variants: {
      variant: {
        primary: "bg-[linear-gradient(#535759,#3b3e40)] text-white hover:bg-[linear-gradient(#6c7073,#535759)] active:bg-[linear-gradient(#3b3e40,#535759)] border-none rounded-none tracking-[0.15em]",
        ghost: "bg-transparent text-white border border-white hover:bg-white/10 rounded-none",
        ghostDark: "bg-transparent text-black border border-black hover:bg-black/5 rounded-none",
        accent: "bg-[var(--accent)] text-[var(--accent-text-on)] hover:bg-[var(--accent-dark)] border-none rounded-none tracking-[0.15em]",
        store: "bg-white text-black hover:bg-[var(--accent)] hover:text-[var(--accent-text-on)] border-none rounded-none tracking-[0.15em]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
