import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-sand px-6 text-center">
      <h1 className="font-display text-[36px] font-semibold text-ink">
        Not here.
      </h1>
      <p className="max-w-[360px] text-[15px] leading-[22px] text-soft">
        That lead or page does not exist. It may have been a demo row that was
        never seeded.
      </p>
      <Link
        href="/admin/inbox"
        className="rounded-full bg-cedar px-5 py-3 text-[14px] font-semibold text-paper hover:bg-deep"
      >
        Back to inbox
      </Link>
    </main>
  );
}
