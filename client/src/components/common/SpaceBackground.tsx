import React, { useEffect, useRef } from 'react';

export const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize 160 stars with varying depth, alpha, and twinkle rates
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
      twinkleSpeed: number;
      twinklePhase: number;
      hue: number;
    }> = [];

    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 1.8 : 2.5,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.15 + 0.03,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.3 ? 190 : Math.random() < 0.5 ? 240 : 210,
      });
    }

    let animFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space Cosmic Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#030712'); // near-black space
      bgGrad.addColorStop(0.5, '#070f26'); // deep cosmic navy
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle Nebula Radial Gradients
      // Top-right cyan nebula glow
      const neb1 = ctx.createRadialGradient(
        width * 0.85,
        height * 0.15,
        50,
        width * 0.85,
        height * 0.15,
        width * 0.45
      );
      neb1.addColorStop(0, 'rgba(0, 240, 255, 0.045)');
      neb1.addColorStop(0.5, 'rgba(14, 165, 233, 0.02)');
      neb1.addColorStop(1, 'transparent');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      // Bottom-left violet/indigo nebula glow
      const neb2 = ctx.createRadialGradient(
        width * 0.15,
        height * 0.85,
        60,
        width * 0.15,
        height * 0.85,
        width * 0.5
      );
      neb2.addColorStop(0, 'rgba(129, 140, 248, 0.04)');
      neb2.addColorStop(0.6, 'rgba(79, 70, 229, 0.015)');
      neb2.addColorStop(1, 'transparent');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, width, height);

      // 3. Faint Orbital Gridlines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 64;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 4. Subtle Earth / Planet Limb Curve in lower corner
      ctx.save();
      ctx.beginPath();
      const planetCenterX = width * 1.05;
      const planetCenterY = height * 1.15;
      const planetRadius = width * 0.42;
      ctx.arc(planetCenterX, planetCenterY, planetRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const planetGlow = ctx.createRadialGradient(
        planetCenterX,
        planetCenterY,
        planetRadius * 0.8,
        planetCenterX,
        planetCenterY,
        planetRadius * 1.05
      );
      planetGlow.addColorStop(0, 'rgba(2, 6, 23, 0.4)');
      planetGlow.addColorStop(0.9, 'rgba(0, 240, 255, 0.06)');
      planetGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = planetGlow;
      ctx.fill();
      ctx.restore();

      // 5. Starfield Particles with slow twinkling & gentle drift
      for (const star of stars) {
        if (!prefersReducedMotion) {
          star.y -= star.speed;
          if (star.y < 0) {
            star.y = height;
            star.x = Math.random() * width;
          }
        }

        const twinkle = prefersReducedMotion
          ? 1
          : Math.sin(time * star.twinkleSpeed * 10 + star.twinklePhase) * 0.35 + 0.65;
        const currentAlpha = Math.max(0.1, Math.min(1, star.alpha * twinkle));

        ctx.fillStyle = `hsla(${star.hue}, 80%, 85%, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra twinkle corona for larger stars
        if (star.size > 2) {
          ctx.fillStyle = `hsla(${star.hue}, 100%, 90%, ${currentAlpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. Orbital Spacecraft Trajectory Path & Marker
      const orbitA = width * 0.45;
      const orbitB = height * 0.28;
      const orbitCenterX = width * 0.5;
      const orbitCenterY = height * 0.48;

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(orbitCenterX, orbitCenterY, orbitA, orbitB, -Math.PI / 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Orbiting Spacecraft Icon Marker
      if (!prefersReducedMotion) {
        const orbitAngle = (time * 0.08) % (Math.PI * 2);
        const rot = -Math.PI / 12;
        const unrotX = orbitA * Math.cos(orbitAngle);
        const unrotY = orbitB * Math.sin(orbitAngle);
        const shipX = orbitCenterX + unrotX * Math.cos(rot) - unrotY * Math.sin(rot);
        const shipY = orbitCenterY + unrotX * Math.sin(rot) + unrotY * Math.cos(rot);

        // Pulsing Spacecraft Diamond Node
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(shipX, shipY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.font = '8px monospace';
        ctx.fillText('AURORA-01 [419 KM]', shipX + 7, shipY - 4);
      }
      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-50 w-full h-full"
    />
  );
};
