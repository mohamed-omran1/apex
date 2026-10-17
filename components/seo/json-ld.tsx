/**
 * Renders a JSON-LD script tag. The payload is stringified and every "<" is
 * escaped so user visible text can never break out of the script element.
 */
export function JsonLd({ data }: { data: object }) {
  const payload = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
