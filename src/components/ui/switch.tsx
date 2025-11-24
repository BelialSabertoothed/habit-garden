import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // základní track
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent outline-none transition-colors",

        // --- LIGHT MODE ---
        // Off
        "bg-gray-300",
        // On
        "data-[state=checked]:bg-emerald-500",

        // --- DARK MODE ---
        // Off
        "dark:bg-slate-600",
        // On (světlejší green)
        "dark:data-[state=checked]:bg-emerald-400",

        // accessibility
        "focus-visible:ring-[3px] focus-visible:ring-emerald-400/40 focus-visible:border-emerald-400",

        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // thumb
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform",
          // posuny
          "translate-x-0 data-[state=checked]:translate-x-[22px]"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };