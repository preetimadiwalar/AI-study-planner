import { useEffect, useState } from "react";

type Variant = "dot" | "star" | "ring";

interface Particle {
  i: number;
  variant: Variant;
  size: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
  hue: number;
  drift: number;
  rise: number;
}

/**
 * Animated colorful glitter particles for light theme hero backgrounds.
 * Mounts on the client only to avoid SSR hydration mismatches from Math.random().
 */
export function GlitterBackground({
  count = 55,
  fixed = false,
}: {
  count?: number;
  /** When true, renders as a fixed full-viewport overlay covering the whole page on scroll. */
  fixed?: boolean;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const variants: Variant[] = ["dot", "dot", "dot", "dot", "star", "star", "ring"];
    const hues = [165, 175, 195, 210, 145, 155, 185];
    const next: Particle[] = Array.from({ length: count }).map((_, i) => {
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const size =
        variant === "star" ? 14 + Math.random() * 18 : 6 + Math.random() * 12;
      return {
        i,
        variant,
        size,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 7 + Math.random() * 8,
        hue: hues[Math.floor(Math.random() * hues.length)],
        drift: (Math.random() - 0.5) * 80,
        rise: 80 + Math.random() * 120,
      };
    });
    setParticles(next);
  }, [count]);

  return (
    <div
      aria-hidden
      className={
        fixed
          ? "pointer-events-none fixed inset-0 overflow-hidden z-0"
          : "pointer-events-none absolute inset-0 overflow-hidden"
      }
    >
      {particles.map((p) => {
        const style: React.CSSProperties & Record<string, string | number> = {
          width: `${p.size}px`,
          height: `${p.size}px`,
          left: `${p.left}%`,
          top: `${p.top}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`,
          "--drift": `${p.drift}px`,
          "--rise": `-${p.rise}px`,
          "--hue": String(p.hue),
        };
        return (
          <span
            key={p.i}
            className={`glitter glitter-${p.variant}`}
            style={style}
          />
        );
      })}
    </div>
  );
}
