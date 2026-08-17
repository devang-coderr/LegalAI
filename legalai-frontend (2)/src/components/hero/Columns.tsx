export function Columns() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-end justify-between opacity-[0.06]"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[75%] w-[3.2%] bg-gradient-to-t from-[var(--ink)] to-transparent"
          style={{ opacity: 1 - i * 0.05 }}
        />
      ))}
    </div>
  );
}
