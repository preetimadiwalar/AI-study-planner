import React, { useEffect, useRef } from "react";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  seed: number;
  color: string;
};

type Pulse = {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
  speed: number;
};

type Flare = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
};

const AIParticlesBackground: React.FC = () => {
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const bgCtx = bgCanvas.getContext("2d", { alpha: false });
    if (!bgCtx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = window.devicePixelRatio || 1;

      bgCanvas.width = w * dpr;
      bgCanvas.height = h * dpr;
      bgCtx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Initial state
    const sparks: Spark[] = [];
    const flares: Flare[] = [];

    const colors = [
      "rgba(225, 29, 72, 0.8)",    // Crimson
      "rgba(255, 0, 0, 0.8)",      // Solid Red
      "rgba(159, 18, 57, 0.8)",    // Rose 900
      "rgba(190, 18, 60, 0.8)"     // Rose 800
    ];

    for (let i = 0; i < 40; i++) {
        sparks.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random(),
        targetAlpha: Math.random(),
        seed: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const spawnFlare = () => {
      flares.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 300 + 100,
        alpha: 0,
        life: 0,
        maxLife: Math.random() * 100 + 100
      });
    };

    let time = 0;
    let lastTime = 0;

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      time += 0.012;

      // fill with current theme background (uses CSS var --background)
      try {
        const bgVar = getComputedStyle(document.documentElement).getPropertyValue('--background')?.trim();
        if (bgVar) bgCtx.fillStyle = `hsl(${bgVar})`;
        else bgCtx.fillStyle = "#000000";
      } catch (e) {
        bgCtx.fillStyle = "#000000";
      }
      bgCtx.fillRect(0, 0, w, h);

      // No cursor interaction: keep static parallax/zoom
      const parallaxX = 0;
      const parallaxY = 0;
      const zoom = 1;

      bgCtx.save();
      bgCtx.translate(w / 2, h / 2);
      bgCtx.scale(zoom, zoom);
      bgCtx.translate(-w / 2 + parallaxX, -h / 2 + parallaxY);

      bgCtx.globalCompositeOperation = "screen";

      if (Math.random() < 0.02) spawnFlare();
      for (let i = flares.length - 1; i >= 0; i--) {
        const f = flares[i];
        f.life++;
        if (f.life < f.maxLife * 0.5) {
          f.alpha += 0.01;
        } else {
          f.alpha -= 0.01;
        }
        if (f.life >= f.maxLife) {
          flares.splice(i, 1);
          continue;
        }
        const g = bgCtx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
        g.addColorStop(0, `rgba(225, 29, 72, ${f.alpha * 0.3})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        bgCtx.fillStyle = g;
        bgCtx.globalAlpha = 1;
        bgCtx.fillRect(0, 0, w, h);
      }

      bgCtx.globalCompositeOperation = "lighter";
      sparks.forEach(p => {
        p.x += p.vx + Math.sin(time * 2.0 + p.seed) * 0.3;
        p.y += p.vy + Math.cos(time * 2.0 + p.seed) * 0.3;

        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40;
        if (p.y > h + 40) p.y = -40;

        if (Math.random() < 0.03) p.targetAlpha = Math.random() * 0.8 + 0.2;
        p.alpha += (p.targetAlpha - p.alpha) * 0.05;

        const size = p.size * (1.6 + Math.sin(time * 3 + p.seed) * 0.5);
        
        bgCtx.save();
        bgCtx.translate(p.x, p.y);
        
        bgCtx.beginPath();
        const grad = bgCtx.createRadialGradient(0, 0, 0, 0, 0, size * 10);
        grad.addColorStop(0, p.color.replace("0.8", (p.alpha * 0.4).toString()));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        bgCtx.fillStyle = grad;
        bgCtx.arc(0, 0, size * 10, 0, Math.PI * 2);
        bgCtx.fill();

        bgCtx.beginPath();
        bgCtx.arc(0, 0, size * 2, 0, Math.PI * 2);
        bgCtx.fillStyle = p.color.replace("0.8", (p.alpha * 0.6).toString());
        bgCtx.fill();
        bgCtx.restore();
      });

      bgCtx.restore();

      requestAnimationFrame(animate);
    };

    // no cursor drawing: do not attach mouse listeners

    const raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      // no cursor listeners to remove
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <canvas
        ref={bgCanvasRef}
        id="bg-canvas"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          pointerEvents: "none",
          background: "hsl(var(--background))",
        }}
      />
      {/* cursor canvas removed to keep cursor normal */}
    </>
  );
};

export default AIParticlesBackground;
