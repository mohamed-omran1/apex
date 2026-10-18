"use client";

import Link from "next/link";
import { site } from "@/lib/content/site";
import "./globals.css";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
          backgroundColor: "var(--color-sand)",
          color: "var(--color-ink)",
          fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <title>Apex Climate Solutions — something went wrong</title>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display), ui-serif, Georgia, serif",
            fontSize: "36px",
            fontWeight: 600,
            color: "var(--color-ink)",
          }}
        >
          The site hit a snag.
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: "360px",
            fontSize: "15px",
            lineHeight: "22px",
            color: "var(--color-soft)",
          }}
        >
          This page could not finish loading. Try again, or call and we will
          help on the phone.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            border: "none",
            borderRadius: "9999px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: "var(--color-cedar)",
            color: "var(--color-paper)",
          }}
        >
          Try again
        </button>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <Link
            href="/"
            style={{
              borderRadius: "9999px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 600,
              backgroundColor: "var(--color-cedar)",
              color: "var(--color-paper)",
              textDecoration: "none",
            }}
          >
            Back home
          </Link>
          <a
            href={site.phoneHref}
            style={{
              borderRadius: "9999px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 600,
              border: "1.5px solid var(--color-cedar)",
              color: "var(--color-cedar)",
              backgroundColor: "var(--color-paper)",
              textDecoration: "none",
            }}
          >
            Call {site.phoneDisplay}
          </a>
          <Link
            href="/book"
            style={{
              borderRadius: "9999px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 600,
              border: "1.5px solid var(--color-cedar)",
              color: "var(--color-cedar)",
              backgroundColor: "var(--color-paper)",
              textDecoration: "none",
            }}
          >
            Book service
          </Link>
        </div>
        {error.digest ? (
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "var(--color-mute)",
            }}
          >
            Reference {error.digest}
          </p>
        ) : null}
      </body>
    </html>
  );
}
