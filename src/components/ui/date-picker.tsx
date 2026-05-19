import { Popover, PopoverTrigger } from "@radix-ui/react-popover"
import { FormControl } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import React from "react"
import { CalendarIcon } from "lucide-react"

interface DatepickerProps {
  value?: Date | null,
  onChange: (date: Date | null) => void,
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder }: DatepickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn(
              "w-full pl-3 text-left font-normal truncate overflow-hidden whitespace-nowrap ",
              !value && "text-muted-foreground"
            )}
          >
            {value ? (
              format(value, "PPP")
            ) : (
              <span>{placeholder ? placeholder : "Pick a date"}</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" collisionPadding={100}>
        <Calendar
          mode="single"
          selected={value as any}
          onSelect={onChange as any}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
