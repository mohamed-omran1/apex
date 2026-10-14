function Star() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-3.5"
    >
      <path d="M12 2.5l2.9 6.05 6.6.85-4.85 4.6 1.25 6.5L12 17.4l-5.9 3.1 1.25-6.5L2.5 9.4l6.6-.85L12 2.5z" />
    </svg>
  );
}

export function Stars({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-gold ${className}`}>
      <Star />
      <Star />
      <Star />
      <Star />
      <Star />
    </span>
  );
}
