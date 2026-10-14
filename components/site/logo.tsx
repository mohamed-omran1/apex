import Link from "next/link";

export function Mark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5 22L16 7L27 22"
        className="stroke-cedar"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 22L16 14L21.8 22"
        className="stroke-copper"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      aria-label="Apex Climate Solutions, home"
    >
      <Mark className="size-7 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[22px] font-semibold text-cedar">
          Apex
        </span>
        <span className="mt-1 hidden text-[9px] font-semibold tracking-[1.2px] text-copper lg:block">
          CLIMATE SOLUTIONS
        </span>
      </span>
    </Link>
  );
}
