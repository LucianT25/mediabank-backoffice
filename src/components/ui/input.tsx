import * as React from "react"

import { cn } from "@/lib/utils"
import {ChangeEvent, useState} from "react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    debounced?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, debounced, onChange, ...props }, ref) => {
      const [timeoutID, setTimeoutID] = useState<any>(null);
      const debouncedOnChange = (event: ChangeEvent<HTMLInputElement>) => {
          if (!onChange) return;
          if (timeoutID) clearTimeout(timeoutID);
          const tid = setTimeout(() => {
              onChange(event);
          }, 1000);
          setTimeoutID(tid);
      };

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={debounced ? debouncedOnChange : onChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
