import React, { useEffect, useRef, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulsePhase: number;
}

interface ConstellationsBackgroundProps {
  className?: string;
}

export const ConstellationsBackground: React.FC<ConstellationsBackgroundProps> = ({
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const starsRef = useRef<Star[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const STAR_COUNT = 80;
  const CONNECTION_DISTANCE = 150;
  const STAR_SPEED = 0.3;

  const createStars = (width: number, height: number): Star[] => {
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * STAR_SPEED,
      vy: (Math.random() - 0.5) * STAR_SPEED,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      pulsePhase: Math.random() * Math.PI * 2
    }));
  };

  const updateStars = (stars: Star[], width: number, height: number) => {
    stars.forEach(star => {
      // Update position
      star.x += star.vx;
      star.y += star.vy;

      // Wrap around edges
      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;
      if (star.y < 0) star.y = height;
      if (star.y > height) star.y = 0;

      // Update pulse phase for twinkling effect
      star.pulsePhase += 0.02;
    });
  };

  const drawStars = (ctx: CanvasRenderingContext2D, stars: Star[]) => {
    stars.forEach(star => {
      const twinkle = Math.sin(star.pulsePhase) * 0.3 + 0.7;
      const alpha = star.opacity * twinkle;

      // Create gradient for star glow
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.size * 3
      );
      gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`);
      gradient.addColorStop(0.3, `rgba(147, 197, 253, ${alpha * 0.6})`);
      gradient.addColorStop(1, `rgba(147, 197, 253, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw core star
      ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawConnections = (ctx: CanvasRenderingContext2D, stars: Star[]) => {
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const star1 = stars[i];
        const star2 = stars[j];

        const dx = star1.x - star2.x;
        const dy = star1.y - star2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONNECTION_DISTANCE) {
          const alpha = (1 - distance / CONNECTION_DISTANCE) * 0.4;

          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(star1.x, star1.y);
          ctx.lineTo(star2.x, star2.y);
          ctx.stroke();
        }
      }
    }
  };

  const animate = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Update and draw stars
    updateStars(starsRef.current, dimensions.width, dimensions.height);
    drawConnections(ctx, starsRef.current);
    drawStars(ctx, starsRef.current);

    animationRef.current = requestAnimationFrame(animate);
  }, [dimensions.width, dimensions.height]);

  const handleResize = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Set actual canvas size for crisp rendering
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    setDimensions({ width, height });

    // Recreate stars for new dimensions
    starsRef.current = createStars(width, height);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, animate]);

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: 'radial-gradient(ellipse at center, #fff 0%, #e2e8f0 35%, #fff 100%)'
        }}
      />

      {/* Canvas for constellation animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />

      {/* Overlay to soften the effect and ensure text readability */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.6) 0%, rgba(226, 232, 240, 0.4) 50%, rgba(203, 213, 225, 0.6) 100%)'
        }}
      />
    </div>
  );
};

export default ConstellationsBackground;
