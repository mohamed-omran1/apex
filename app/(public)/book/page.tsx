import type { Metadata } from "next";
import { BookingForm } from "@/components/book/booking-form";
import { getActiveZips } from "@/lib/lead/areas";

export const metadata: Metadata = {
  title: "Book a visit",
  description:
    "Send Apex the short form: name, phone, ZIP, and what the system is doing. The owner calls you back, usually the same day. Around the clock.",
};

export default async function BookPage() {
  const activeZips = await getActiveZips();

  return (
    <section className="bg-sand px-5 pt-14 pb-32 lg:px-20 lg:py-24">
      <div className="mx-auto max-w-[1100px]">
        <BookingForm activeZips={activeZips} />
      </div>
    </section>
  );
}
