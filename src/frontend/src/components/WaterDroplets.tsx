// File: src/frontend/src/components/WaterDroplets.tsx
import React, { useEffect, useRef } from 'react';

const WaterDroplets = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let droplets: Droplet[] = [];
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
    let lastMouse = { x: -1000, y: -1000 };
    let cursorDrop = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Droplet {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      baseSpeedY: number;
      isSplash: boolean;

      constructor(isSplash = false) {
        this.isSplash = isSplash;
        this.x = isSplash ? mouse.x : Math.random() * canvas.width;
        this.y = isSplash ? mouse.y : Math.random() * canvas.height - canvas.height;
        this.size = isSplash ? Math.random() * 2 + 1 : Math.random() * 2.5 + 1; // Smaller droplets
        this.baseSpeedY = Math.random() * 1 + 0.5;
        this.speedY = this.baseSpeedY;
        this.speedX = 0;
        this.opacity = isSplash ? 0.6 : Math.random() * 0.3 + 0.1;
      }

      update() {
        // Distance to mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Follow cursor effect
        if (distance < 150) {
          const force = (150 - distance) / 150;
          this.speedX += (dx / distance) * force * 0.15;
          this.speedY += (dy / distance) * force * 0.15;
        }

        // Friction and gravity
        this.speedX *= 0.96;
        this.speedY = this.speedY * 0.96 + this.baseSpeedY * 0.04;

        this.x += this.speedX;
        this.y += this.speedY;

        if (this.isSplash) {
          this.opacity -= 0.01;
        }

        // Reset if off screen (only for background droplets)
        if (!this.isSplash) {
          if (this.y > canvas.height + 10) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
            this.speedX = 0;
            this.speedY = this.baseSpeedY;
          }
          if (this.x > canvas.width + 10) this.x = -10;
          if (this.x < -10) this.x = canvas.width + 10;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(0, this.opacity)})`;
        ctx.fill();
      }
    }

    // Initialize background droplets
    for (let i = 0; i < 60; i++) {
      droplets.push(new Droplet());
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.vx = mouse.x - lastMouse.x;
      mouse.vy = mouse.y - lastMouse.y;
      
      // Add splash droplets on fast movement
      const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      if (speed > 5 && Math.random() > 0.3) {
        const splash = new Droplet(true);
        splash.x = mouse.x + (Math.random() * 20 - 10);
        splash.y = mouse.y + (Math.random() * 20 - 10);
        splash.speedX = mouse.vx * 0.1 + (Math.random() * 2 - 1);
        splash.speedY = mouse.vy * 0.1 + (Math.random() * 2 - 1);
        droplets.push(splash);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update cursor drop position (spring physics)
      if (mouse.x > -1000) {
        if (cursorDrop.x === -1000) {
          cursorDrop.x = mouse.x;
          cursorDrop.y = mouse.y;
        } else {
          cursorDrop.x += (mouse.x - cursorDrop.x) * 0.2;
          cursorDrop.y += (mouse.y - cursorDrop.y) * 0.2;
        }
      }

      // Draw a subtle glow around cursor drop
      if (cursorDrop.x > -1000) {
        const gradient = ctx.createRadialGradient(cursorDrop.x, cursorDrop.y, 0, cursorDrop.x, cursorDrop.y, 100);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw main cursor drop
        ctx.beginPath();
        ctx.arc(cursorDrop.x, cursorDrop.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.fill();
        
        // Highlight
        ctx.beginPath();
        ctx.arc(cursorDrop.x - 2, cursorDrop.y - 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
      }

      // Update and draw all droplets
      for (let i = droplets.length - 1; i >= 0; i--) {
        const droplet = droplets[i];
        droplet.update();
        droplet.draw();
        
        // Remove dead splash droplets
        if (droplet.isSplash && droplet.opacity <= 0) {
          droplets.splice(i, 1);
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
};

export default WaterDroplets;
