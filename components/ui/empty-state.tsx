import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-line bg-paper px-6 py-14 text-center">
      <p className="font-display text-[22px] leading-[28px] text-ink">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-[20px] text-soft">
        {body}
      </p>
      {children}
    </div>
  );
}
