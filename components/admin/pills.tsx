import type { ReactNode } from "react";

export const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  completed: "Completed",
  lost: "Lost",
  spam: "Spam",
};

export const kindLabels: Record<string, string> = {
  emergency: "Emergency",
  repair: "Repair",
  estimate: "In-home estimate",
  tune_up: "Tune-up",
  membership_enquiry: "Membership",
};

const statusPill: Record<string, string> = {
  new: "bg-sage text-cedar border-transparent",
  contacted: "bg-sand text-soft border-line",
  scheduled: "bg-peach/40 text-deep border-transparent",
  completed: "bg-deep text-paper border-transparent",
  lost: "bg-dust/40 text-mute border-line",
  spam: "bg-heat/10 text-heat border-heat/30",
};

const kindPill: Record<string, string> = {
  emergency: "bg-heat/10 text-heat border-heat/25",
  repair: "bg-sand text-soft border-line",
  estimate: "bg-sage text-cedar border-transparent",
  tune_up: "bg-sand text-soft border-line",
  membership_enquiry: "bg-sand text-soft border-line",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
        statusPill[status] ?? "bg-sand text-soft border-line"
      }`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

export function KindPill({ kind }: { kind: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium ${
        kindPill[kind] ?? "bg-sand text-soft border-line"
      }`}
    >
      {kindLabels[kind] ?? kind}
    </span>
  );
}

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[16px] border border-line bg-paper p-4 ${className}`}
    >
      {children}
    </div>
  );
}
