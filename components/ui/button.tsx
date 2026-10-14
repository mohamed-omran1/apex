import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "ghost" | "light" | "outlineLight";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-cedar text-paper hover:bg-deep",
  ghost: "border-[1.5px] border-cedar bg-paper text-cedar hover:bg-sage",
  light: "bg-paper text-deep hover:bg-sand",
  outlineLight: "border-[1.5px] border-paper text-paper hover:bg-paper/10",
};

export function buttonClass(variant: ButtonVariant, extra = ""): string {
  return `inline-flex min-h-11 items-center justify-center rounded-full px-[18px] py-4 text-center text-[16px] font-semibold leading-5 transition-colors lg:py-[14px] lg:text-[15px] lg:leading-normal ${variants[variant]} ${extra}`;
}

export function ButtonLink({
  href,
  variant,
  children,
  className = "",
}: {
  href: string;
  variant: ButtonVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
