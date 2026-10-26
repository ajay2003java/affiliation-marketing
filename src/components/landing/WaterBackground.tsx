import React, { useEffect, useRef } from 'react';

interface ColorOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  colorStop0: string;
  colorStop1: string;
  colorStop2: string;
}

interface TouchPulse {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

export const WaterBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;

    // Track pointer (mouse & touch) coordinates with smooth liquid physics
    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      prevX: 0,
      prevY: 0,
      vx: 0,
      vy: 0,
      isActive: false,
      lastInteractionTime: performance.now()
    };

    // Lagging fluid secondary echo (creates liquid trailing effect)
    const fluidTrail = {
      x: 0,
      y: 0
    };

    // Ambient floating fluid color orbs that breathe and move continuously
    const ambientOrb = {
      x: 0,
      y: 0,
      angle: 0
    };

    const pulses: TouchPulse[] = [];

    // Trigger an expanding soft color bloom on tap / click
    const addPulse = (x: number, y: number, maxRadius = 320, color = 'rgba(56, 189, 248,') => {
      if (pulses.length > 8) pulses.shift();
      pulses.push({
        x,
        y,
        radius: 10,
        maxRadius,
        opacity: 0.65,
        color
      });
    };

    // Sizing & high-DPI scaling
    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 420);

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform matrix
      ctx.scale(dpr, dpr);

      if (!pointer.isActive) {
        pointer.x = pointer.targetX = width * 0.5;
        pointer.y = pointer.targetY = height * 0.38;
        fluidTrail.x = pointer.x;
        fluidTrail.y = pointer.y;
        ambientOrb.x = width * 0.5;
        ambientOrb.y = height * 0.4;
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Unified pointer & touch coordinates converter
    const updatePointerFromCoords = (clientX: number, clientY: number, isImpact = false) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      pointer.targetX = Math.max(0, Math.min(width, x));
      pointer.targetY = Math.max(0, Math.min(height, y));
      pointer.isActive = true;
      pointer.lastInteractionTime = performance.now();

      if (isImpact) {
        addPulse(pointer.targetX, pointer.targetY, Math.min(width * 0.8, 380));
      }
    };

    // Desktop Mouse Handlers
    const onMouseMove = (e: MouseEvent) => {
      updatePointerFromCoords(e.clientX, e.clientY, false);
    };

    const onMouseDown = (e: MouseEvent) => {
      updatePointerFromCoords(e.clientX, e.clientY, true);
    };

    // Mobile Phone Touch Handlers
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerFromCoords(touch.clientX, touch.clientY, true);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerFromCoords(touch.clientX, touch.clientY, false);
      }
    };

    const onTouchEnd = () => {
      pointer.lastInteractionTime = performance.now();
    };

    // Phone Gyroscope (Tilting phone sways the fluid color around the screen)
    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma is left-to-right (-90 to 90), beta is front-to-back (-180 to 180)
        const tiltX = (Math.max(-45, Math.min(45, e.gamma)) / 45) * (width * 0.35) + width * 0.5;
        const tiltY = ((Math.max(10, Math.min(70, e.beta)) - 40) / 30) * (height * 0.3) + height * 0.4;

        pointer.targetX = tiltX;
        pointer.targetY = tiltY;
        pointer.isActive = true;
        pointer.lastInteractionTime = performance.now();
      }
    };

    // Window scroll interaction on mobile (scrolling moves the fluid color with inertia)
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const deltaY = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      pointer.targetY = Math.max(40, Math.min(height - 40, pointer.targetY - deltaY * 0.35));
    };

    // Register listeners with { passive: true } for stutter-free scrolling on mobile
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    let time = 0;

    const render = () => {
      time += 0.02;

      const now = performance.now();
      const idleTime = now - pointer.lastInteractionTime;

      // When user is not actively moving (especially on phone without mouse hover),
      // softly drift the liquid color target in an organic, living figure-8 curve
      if (idleTime > 800) {
        const idleBlend = Math.min((idleTime - 800) / 1200, 1.0);
        const naturalX = width * 0.5 + Math.sin(time * 0.8) * (width * 0.28) + Math.cos(time * 1.4) * (width * 0.1);
        const naturalY = height * 0.38 + Math.cos(time * 0.6) * (height * 0.18) + Math.sin(time * 1.1) * (height * 0.08);

        pointer.targetX = pointer.targetX * (1 - idleBlend * 0.05) + naturalX * (idleBlend * 0.05);
        pointer.targetY = pointer.targetY * (1 - idleBlend * 0.05) + naturalY * (idleBlend * 0.05);
      }

      // Smooth liquid spring inertia for main cursor pointer
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x += (pointer.targetX - pointer.x) * 0.075;
      pointer.y += (pointer.targetY - pointer.y) * 0.075;
      pointer.vx = pointer.x - pointer.prevX;
      pointer.vy = pointer.y - pointer.prevY;

      // Trailing viscous fluid echo (slightly lags behind main cursor)
      fluidTrail.x += (pointer.x - fluidTrail.x) * 0.042;
      fluidTrail.y += (pointer.y - fluidTrail.y) * 0.042;

      // Ambient secondary liquid orb (counter-swirls slowly)
      ambientOrb.angle += 0.015;
      ambientOrb.x = width * 0.5 + Math.cos(ambientOrb.angle) * (width * 0.24);
      ambientOrb.y = height * 0.42 + Math.sin(ambientOrb.angle * 1.3) * (height * 0.14);

      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      // Use 'screen' / 'lighter' composite mode so the moving colors illuminate the watercolor background
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // 1. PRIMARY CURSOR FLUID ILLUMINATION
      // Moving the cursor moves this radiant pool of sapphire, cyan & sky-blue light
      const mainRadius = Math.max(220, Math.min(width * 0.6, 420));
      const mainGlow = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        mainRadius
      );
      // Soft fluid color layers that blend seamlessly
      mainGlow.addColorStop(0, 'rgba(56, 189, 248, 0.42)'); // Vibrant cyan
      mainGlow.addColorStop(0.25, 'rgba(14, 165, 233, 0.28)'); // Oceanic cerulean
      mainGlow.addColorStop(0.55, 'rgba(2, 132, 199, 0.14)'); // Deep royal sapphire
      mainGlow.addColorStop(0.85, 'rgba(3, 105, 161, 0.04)');
      mainGlow.addColorStop(1, 'rgba(3, 105, 161, 0)');

      ctx.fillStyle = mainGlow;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, mainRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. TRAILING LIQUID ECHO (creates fluid drag & movement feel)
      const trailRadius = mainRadius * 0.75;
      const trailGlow = ctx.createRadialGradient(
        fluidTrail.x,
        fluidTrail.y,
        0,
        fluidTrail.x,
        fluidTrail.y,
        trailRadius
      );
      trailGlow.addColorStop(0, 'rgba(99, 102, 241, 0.28)'); // Subtle indigo-violet sheen
      trailGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.16)');
      trailGlow.addColorStop(0.8, 'rgba(14, 165, 233, 0.03)');
      trailGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');

      ctx.fillStyle = trailGlow;
      ctx.beginPath();
      ctx.arc(fluidTrail.x, fluidTrail.y, trailRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. AMBIENT LIVING LIQUID BREATHER (keeps phone version alive without touches)
      const ambientRadius = mainRadius * 0.65;
      const ambientGlow = ctx.createRadialGradient(
        ambientOrb.x,
        ambientOrb.y,
        0,
        ambientOrb.x,
        ambientOrb.y,
        ambientRadius
      );
      ambientGlow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      ambientGlow.addColorStop(0.5, 'rgba(14, 165, 233, 0.1)');
      ambientGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');

      ctx.fillStyle = ambientGlow;
      ctx.beginPath();
      ctx.arc(ambientOrb.x, ambientOrb.y, ambientRadius, 0, Math.PI * 2);
      ctx.fill();

      // 4. SOFT EXPANSIVE COLOR BLOOM (when tapping or clicking)
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.radius += (p.maxRadius - p.radius) * 0.085 + 2.5;
        p.opacity *= 0.94;

        if (p.opacity > 0.01 && p.radius < p.maxRadius) {
          const pulseGrad = ctx.createRadialGradient(
            p.x,
            p.y,
            p.radius * 0.2,
            p.x,
            p.y,
            p.radius
          );
          pulseGrad.addColorStop(0, `${p.color}${p.opacity * 0.35})`);
          pulseGrad.addColorStop(0.5, `${p.color}${p.opacity * 0.18})`);
          pulseGrad.addColorStop(1, `${p.color}0)`);

          ctx.fillStyle = pulseGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          pulses.splice(i, 1);
        }
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};
