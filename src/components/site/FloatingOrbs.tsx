export function FloatingOrbs({ variant = "light" }: { variant?: "light" | "dark" }) {
  const color = variant === "dark" ? "oklch(0.42 0.05 50 / 0.4)" : "oklch(0.42 0.05 50 / 0.18)";
  const color2 = variant === "dark" ? "oklch(0.78 0.12 80 / 0.25)" : "oklch(0.78 0.12 80 / 0.15)";
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full blur-3xl animate-float-slow"
        style={{ background: color }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full blur-3xl animate-float-slower"
        style={{ background: color2 }}
      />
      <div
        className="absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full blur-3xl animate-float-slow"
        style={{ background: color }}
      />
    </div>
  );
}
