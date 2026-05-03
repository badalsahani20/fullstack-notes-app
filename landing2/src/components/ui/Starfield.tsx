import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  depth: number;
}

export const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stars = useRef<Star[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const easedMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initStars = () => {
      const starCount = 40;
      const newStars: Star[] = [];
      for (let i = 0; i < starCount; i++) {
        // Biased distribution: Favor the center (25% to 75% range)
        // We give stars a 70% chance to be in the center, 30% to be scattered
        let x: number;
        if (Math.random() < 0.75) {
          // Cluster in the middle 50%
          x = (Math.random() * 0.5 + 0.25) * canvas.width;
        } else {
          // Sparse scattering anywhere
          x = Math.random() * canvas.width;
        }

        // Normalized distance from center (0 = center, 1 = edge)
        const distFromCenter = Math.abs(x - canvas.width / 2) / (canvas.width / 2);
        
        // Stars at center are tiny (0.4 - 0.8px), edges can be larger (up to 1.8px)
        const sizeBase = 0.4 + (distFromCenter * 1.0); 
        const size = Math.random() * 0.4 + sizeBase;

        newStars.push({
          x: x,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2 + 0.05, // Slightly faster, favoring right drift
          vy: (Math.random() - 0.5) * 0.2 + 0.05, // Slightly faster, favoring downward drift
          size: size,
          opacity: Math.random() * 0.7 + 0.3,
          depth: Math.random() * 0.8 + 0.2,
        });
      }
      stars.current = newStars;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const animate = () => {
      // Ease mouse position for organic movement
      easedMouse.current.x += (mouse.current.x - easedMouse.current.x) * 0.05;
      easedMouse.current.y += (mouse.current.y - easedMouse.current.y) * 0.05;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.current.forEach((star) => {
        // Update star position (auto-drift)
        star.x += star.vx;
        star.y += star.vy;

        // Calculate offset based on eased mouse and star's unique depth
        // Reduced multiplier from 50 to 15 for a much more subtle effect
        const offsetX = easedMouse.current.x * star.depth * 15;
        const offsetY = easedMouse.current.y * star.depth * 15;

        // Wrap stars around the screen (accounting for drift + parallax)
        let drawX = (star.x + offsetX) % canvas.width;
        let drawY = (star.y + offsetY) % canvas.height;
        if (drawX < 0) drawX += canvas.width;
        if (drawY < 0) drawY += canvas.height;

        // Draw the star
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[0] pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};
