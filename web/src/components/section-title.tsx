import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface SectionTitpleProps extends ComponentProps<'h3'> { }

export function SectionTitle({ className, ...props }: SectionTitpleProps) {
    return (
        <h3
            className={twMerge(`text-base font-semibold text-zinc-100 ${className}`)} {...props}
        />
    )
}