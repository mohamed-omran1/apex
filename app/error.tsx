"use client";

import { useEffect } from "react";
import { RecoveryLinks } from "@/components/site/recovery-links";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Server logs already carry the detail; keep only the digest on the client.
    console.error("[app:error]", error.digest ?? "unknown");
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-sand px-6 text-center">
      <h1 className="font-display text-[36px] font-semibold text-ink">
        Something broke on this page.
      </h1>
      <p className="max-w-[360px] text-[15px] leading-[22px] text-soft">
        That is on us, not on you. Try again, or call and we will sort it out
        on the phone.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-full bg-cedar px-5 py-3 text-[14px] font-semibold text-paper hover:bg-deep"
      >
        Try again
      </button>
      <RecoveryLinks />
    </main>
  );
}
