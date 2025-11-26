import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-app-hover",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-app-border text-app-text-primary hover:bg-app-hover",
        secondary:
          "border-transparent bg-app-dark text-app-text-secondary hover:bg-app-border",
        destructive:
          "border-transparent bg-status-error text-app-text-primary hover:opacity-90",
        outline: "text-app-text-primary border-app-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
