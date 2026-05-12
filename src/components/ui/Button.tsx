import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 uppercase tracking-[1.5px] font-heading",
  {
    variants: {
      variant: {
        primary: "bg-white text-black hover:bg-gray-200 border border-white rounded-sm",
        secondary: "bg-[#262b2e] text-white hover:bg-[#3b3e40] border border-[#3b3e40] rounded-sm",
        ghost: "bg-transparent text-white border border-white/50 hover:border-white hover:bg-white/10 rounded-sm",
        ghostDark: "bg-transparent text-black border border-black/50 hover:border-black hover:bg-black/5 rounded-sm",
        accent: "bg-[var(--accent)] text-[var(--accent-text-on)] hover:bg-[var(--accent-dark)] border-none rounded-sm font-bold",
        store: "bg-white text-black hover:bg-[var(--accent)] hover:text-[var(--accent-text-on)] border-none rounded-sm",
        danger: "bg-rose-600 text-white hover:bg-rose-700 border-none rounded-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-sm px-4 text-[13px]",
        lg: "h-12 rounded-sm px-8 text-base",
        icon: "h-10 w-10",
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
