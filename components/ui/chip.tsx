export function Chip({
  children,
  tone = "paper",
}: {
  children: React.ReactNode;
  tone?: "paper" | "sand";
}) {
  const bg = tone === "sand" ? "bg-sand" : "bg-paper";
  return (
    <li
      className={`flex min-h-11 w-full items-center rounded-chip px-4 py-3.5 text-[15px] leading-5 font-medium text-ink ${bg}`}
    >
      {children}
    </li>
  );
}
