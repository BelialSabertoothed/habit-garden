import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "./utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(function Slider(
  { className, defaultValue, value, min = 0, max = 100, ...props },
  ref
) {
  const {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    ...rest
  } = props;

  const thumbCount =
    Array.isArray(value)
      ? value.length
      : Array.isArray(defaultValue)
      ? defaultValue.length
      : 1;

  return (
    <SliderPrimitive.Root
      ref={ref}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      aria-label={ariaLabel ?? (ariaLabelledby ? undefined : "Slider")}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...rest}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>

      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
});


export { Slider };
