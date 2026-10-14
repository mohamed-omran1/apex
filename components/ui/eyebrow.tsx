import type { ReactNode } from "react";

export function Eyebrow({
  children,
  size = "md",
  className = "",
}: {
  children: ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  const scale =
    size === "sm" ? "text-[11px] tracking-[0.8px]" : "text-[12px] tracking-[1.1px]";
  return (
    <p className={`font-semibold text-copper ${scale} ${className}`}>{children}</p>
  );
}
