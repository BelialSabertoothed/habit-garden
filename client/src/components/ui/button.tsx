import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonVariantProps } from "./button-variants";
import { buildButtonClasses } from "./button-variants";

type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariantProps & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={buildButtonClasses({ variant, size, className })}
      {...props}
    />
  );
}

export { Button };
