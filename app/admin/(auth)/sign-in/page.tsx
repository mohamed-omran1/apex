import type { Metadata } from "next";
import { SignInFlow } from "@/components/admin/sign-in-flow";
import { Mark } from "@/components/site/logo";
import { createSessionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Reads searchParams for the next path; must not be prerendered.
export const instant = false;

export const metadata: Metadata = {
  title: "Sign in · Apex owner desk",
  robots: { index: false, follow: false },
};

function safeNext(raw: string | null): string {
  return raw && /^\/admin(\/[a-z0-9/_-]+)?$/i.test(raw) ? raw : "/admin/inbox";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next ?? null);

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.app_metadata?.role === "admin") {
    redirect(next);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-sand">
      <div className="border-b border-line bg-ink px-4 py-2 text-center text-[11px] leading-[16px] text-sand">
        Fictional demo company. This desk is not a real service.
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex items-center gap-2">
            <Mark className="size-8" />
            <span className="font-display text-[24px] font-semibold text-cedar">
              Apex
            </span>
          </div>
          <div className="rounded-[18px] border border-line bg-paper p-7 shadow-none">
            <SignInFlow email="" next={next} />
          </div>
          <p className="mt-6 text-center text-[12px] leading-[18px] text-mute">
            TACLB000000C · Dallas, TX · fictional placeholder license
          </p>
        </div>
      </div>
    </main>
  );
}
