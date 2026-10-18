import type { Metadata } from "next";
import { ContentPage } from "@/components/site/content-page";
import { EmptyState } from "@/components/ui/empty-state";
import { Stars } from "@/components/ui/stars";
import { trustPages } from "@/lib/content/trust";
import { formatReviewDate, getPublishedReviews } from "@/lib/lead/reviews";
import { publicMetadata } from "@/lib/seo/metadata";

const content = trustPages.reviews;

export const metadata: Metadata = publicMetadata({
  title: content.title,
  description: content.description,
  path: content.path,
});

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews();

  return (
    <ContentPage page={content}>
      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet."
          body="When the owner publishes one from the admin desk, it shows up right here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col gap-3 rounded-card border border-line bg-paper p-[18px]"
            >
              <div className="flex items-center justify-between gap-2">
                <Stars rating={review.rating} />
                {review.isSample ? (
                  <span className="rounded-full bg-sample px-2 py-1 text-[10px] font-semibold tracking-[0.6px] text-copper">
                    SAMPLE
                  </span>
                ) : null}
              </div>
              <blockquote className="font-display text-[18px] leading-[26px] italic text-ink">
                {review.body}
              </blockquote>
              <div>
                <p className="text-[14px] font-semibold text-ink">
                  {review.name}
                </p>
                <p className="text-[13px] leading-[18px] text-mute">
                  {formatReviewDate(review.reviewedOn)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </ContentPage>
  );
}
