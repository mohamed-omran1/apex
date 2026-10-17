export function Chip({
  children,
  tone = "paper",
  variant = "block",
}: {
  children: React.ReactNode;
  tone?: "paper" | "sand";
  /**
   * "block" fills its grid cell (the services pages). "pill" hugs its
   * content in a wrapping row (the area page neighborhoods).
   */
  variant?: "block" | "pill";
}) {
  const bg = tone === "sand" ? "bg-sand" : "bg-paper";
  const width = variant === "pill" ? "shrink-0 border border-line" : "w-full";
  return (
    <li
      className={`flex min-h-11 items-center rounded-chip px-4 py-3.5 text-[15px] leading-5 font-medium text-ink ${bg} ${width}`}
    >
      {children}
    </li>
  );
}
