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
  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    active: false,
    clicking: false,
    lerpX: -1000,
    lerpY: -1000
  });

  const trailRef = useRef<Array<{ x: number, y: number, t: number }>>([]);

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const cursorCanvas = cursorCanvasRef.current;
    if (!bgCanvas || !cursorCanvas) return;

    const bgCtx = bgCanvas.getContext("2d", { alpha: false });
    const cursorCtx = cursorCanvas.getContext("2d");
    if (!bgCtx || !cursorCtx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = window.devicePixelRatio || 1;

      [bgCanvas, cursorCanvas].forEach(c => {
        c.width = w * dpr;
        c.height = h * dpr;
      });

      bgCtx.scale(dpr, dpr);
      cursorCtx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Initial state
    const sparks: Spark[] = [];
    const pulses: Pulse[] = [];
    const flares: Flare[] = [];

    const colors = [
      "rgba(255, 0, 50, 0.8)",   // Pure Neon Red
      "rgba(255, 20, 147, 0.8)", // Hot Pink
      "rgba(255, 69, 0, 0.8)",   // Red Orange
      "rgba(255, 0, 100, 0.8)"   // Crimson
    ];

    for (let i = 0; i < 160; i++) {
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

    const spawnPulse = (x?: number, y?: number) => {
      pulses.push({
        x: x ?? Math.random() * w,
        y: y ?? Math.random() * h,
        r: 0,
        maxR: Math.random() * 500 + 300,
        alpha: 0.6,
        speed: 4 + Math.random() * 4
      });
    };

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
      time += 0.012; // Faster waves

      // --- Background Layer ---
      bgCtx.fillStyle = "#000000";
      bgCtx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      if (mouseRef.current.lerpX === -1000) {
        mouseRef.current.lerpX = mx;
        mouseRef.current.lerpY = my;
      } else {
        mouseRef.current.lerpX += (mx - mouseRef.current.lerpX) * 0.08;
        mouseRef.current.lerpY += (my - mouseRef.current.lerpY) * 0.08;
      }

      const lmx = mouseRef.current.lerpX;
      const lmy = mouseRef.current.lerpY;
      const parallaxX = (lmx - w / 2) * 0.06;
      const parallaxY = (lmy - h / 2) * 0.06;
      const zoom = 1 + (mx !== -1000 ? 0.05 : 0);

      bgCtx.save();
      bgCtx.translate(w / 2, h / 2);
      bgCtx.scale(zoom, zoom);
      bgCtx.translate(-w / 2 + parallaxX, -h / 2 + parallaxY);

      bgCtx.globalCompositeOperation = "screen";

      // Much brighter Aurora Waves
      const drawAurora = (cx: number, cy: number, r: number, color1: string, color2: string, op: number) => {
        const gradient = bgCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.4, color2);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        bgCtx.fillStyle = gradient;
        bgCtx.globalAlpha = op;
        bgCtx.fillRect(0, 0, w, h);
      };

      // Aurora Waves removed for "Full Black" background

      // 4. Flares
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
        g.addColorStop(0, `rgba(255, 30, 80, ${f.alpha * 0.4})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        bgCtx.fillStyle = g;
        bgCtx.globalAlpha = 1;
        bgCtx.fillRect(0, 0, w, h);
      }

      // Sparks (Brighter and larger)
      bgCtx.globalCompositeOperation = "lighter";
      bgCtx.globalAlpha = 1;
      sparks.forEach(p => {
        // Movement re-enabled
        p.x += p.vx + Math.sin(time * 2.0 + p.seed) * 0.3;
        p.y += p.vy + Math.cos(time * 2.0 + p.seed) * 0.3;

        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40;
        if (p.y > h + 40) p.y = -40;

        if (Math.random() < 0.03) p.targetAlpha = Math.random() * 0.8 + 0.2;
        p.alpha += (p.targetAlpha - p.alpha) * 0.05;

        const size = p.size * (1.6 + Math.sin(time * 3 + p.seed) * 0.5);
        const width = size * 14; 
        const height = size * 6; 
        const radius = height / 2;

        // Rotation re-enabled for dynamic look
        bgCtx.save();
        bgCtx.translate(p.x, p.y);
        bgCtx.rotate(time * 0.3 + p.seed); // Dynamic rotation
        
        bgCtx.beginPath();
        bgCtx.roundRect(-width / 2, -height / 2, width, height, radius);
        const grad = bgCtx.createRadialGradient(0, 0, 0, 0, 0, width / 2);
        // Dull red pool
        grad.addColorStop(0, p.color.replace("0.8", (p.alpha * 0.45).toString()));
        grad.addColorStop(1, "rgba(255, 0, 0, 0)");
        bgCtx.fillStyle = grad;
        bgCtx.fill();

        // Inner soft core
        bgCtx.beginPath();
        bgCtx.roundRect(-4, -1.5, 8, 3, 1.5);
        bgCtx.fillStyle = p.color.replace("0.8", (p.alpha * 0.3).toString());
        bgCtx.fill();
        bgCtx.restore();
      });

      bgCtx.restore();

      // --- Cursor Layer (Top) ---
      cursorCtx.clearRect(0, 0, w, h);

      // Pulses (Thicker)
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += p.speed;
        p.alpha -= 0.008;
        if (p.alpha <= 0 || p.r >= p.maxR) {
          pulses.splice(i, 1);
          continue;
        }
        cursorCtx.beginPath();
        cursorCtx.strokeStyle = `rgba(255, 50, 100, ${p.alpha})`;
        cursorCtx.lineWidth = 4 * p.alpha;
        cursorCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        cursorCtx.stroke();
      }

      if (mouseRef.current.active) {
        const cx = mouseRef.current.x;
        const cy = mouseRef.current.y;

        // Trail (Ghost-like)
        trailRef.current.push({ x: cx, y: cy, t: Date.now() });
        if (trailRef.current.length > 20) trailRef.current.shift();

        cursorCtx.globalCompositeOperation = "lighter";
        for (let i = 0; i < trailRef.current.length; i++) {
          const pt = trailRef.current[i];
          const age = Date.now() - pt.t;
          const alpha = Math.max(0, (1 - age / 800) * 0.15);
          const size = (i / trailRef.current.length) * 15;
          
          cursorCtx.beginPath();
          const grad = cursorCtx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, size);
          grad.addColorStop(0, `rgba(255, 10, 50, ${alpha})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          cursorCtx.fillStyle = grad;
          cursorCtx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
          cursorCtx.fill();
        }

        // Main Body (Large, Dull, Ring-like)
        const outerSize = 35 + Math.sin(time * 2) * 5;
        
        // Outer soft glow
        const mainGrad = cursorCtx.createRadialGradient(cx, cy, 0, cx, cy, outerSize);
        mainGrad.addColorStop(0, "rgba(255, 0, 50, 0.15)");
        mainGrad.addColorStop(1, "rgba(50, 0, 0, 0)");
        cursorCtx.fillStyle = mainGrad;
        cursorCtx.beginPath();
        cursorCtx.arc(cx, cy, outerSize, 0, Math.PI * 2);
        cursorCtx.fill();

        // Subtle Ring
        cursorCtx.beginPath();
        cursorCtx.strokeStyle = "rgba(255, 50, 80, 0.25)";
        cursorCtx.lineWidth = 1.5;
        cursorCtx.arc(cx, cy, 12, 0, Math.PI * 2);
        cursorCtx.stroke();
      }

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseDown = (e: MouseEvent) => {
      spawnPulse(e.clientX, e.clientY);
      mouseRef.current.clicking = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.clicking = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    const raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
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
          background: "#000",
        }}
      />
      <canvas
        ref={cursorCanvasRef}
        id="cursor-canvas"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default AIParticlesBackground;
