import { useEffect, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) setEnabled(true);
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!enabled) return null;
  return (
    <div
      className="pointer-events-none fixed z-[100] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl mix-blend-multiply transition-transform duration-200 ease-out"
      style={{
        left: pos.x,
        top: pos.y,
        background: "radial-gradient(circle, oklch(0.78 0.12 80 / 0.35), transparent 70%)",
      }}
    />
  );
}
