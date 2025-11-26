import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-app-border bg-app-dark text-app-text-primary px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-app-text-primary placeholder:text-app-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-app-hover disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
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
