'use client';

import { useEffect, useRef } from 'react';

/** Soft, slow snowfall on a canvas. Skipped entirely for reduced-motion users. */
export function Snow({ density = 70, className = '' }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const flakes = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 2.2,
      speed: 0.15 + Math.random() * 0.45,
      drift: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const tick = () => {
      if (visible) {
        ctx.clearRect(0, 0, width, height);
        for (const f of flakes) {
          f.y += (f.speed * f.r) / height;
          f.drift += 0.01;
          f.x += Math.sin(f.drift) * 0.0004;
          if (f.y > 1.02) {
            f.y = -0.02;
            f.x = Math.random();
          }
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,249,243,${0.25 + f.r / 4.5})`;
          ctx.arc(f.x * width, f.y * height, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}
