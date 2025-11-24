import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "./utils";
import { buttonVariants } from "./button-variants";

import type * as React from "react";
import type { ClassNames, DayPickerSingleProps } from "react-day-picker";

export type CalendarProps = Omit<DayPickerSingleProps, "classNames"> & {
  classNames?: ClassNames;
  className?: string;
  showOutsideDays?: boolean;
};

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = "single",
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      mode={mode}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-foreground/90 select-none",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-100 hover:bg-accent"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "grid grid-cols-7",
        head_cell:
          "text-muted-foreground rounded-md w-9 h-9 font-normal text-[0.8rem] grid place-items-center",
        row: "grid grid-cols-7 mt-1",
        cell:
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus-visible:ring-primary/30",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-accent-foreground",
        day_disabled: "opacity-50 pointer-events-none",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        PreviousMonthButton: (btnProps) => (
          <button
            {...btnProps}
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-7 w-7 bg-transparent p-0 hover:bg-accent"
            )}
            aria-label={btnProps["aria-label"] ?? "Previous month"}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ),
        NextMonthButton: (btnProps) => (
          <button
            {...btnProps}
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-7 w-7 bg-transparent p-0 hover:bg-accent"
            )}
            aria-label={btnProps["aria-label"] ?? "Next month"}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ),
      }}
      {...props}
    />
  );
}
