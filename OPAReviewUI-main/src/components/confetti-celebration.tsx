/**
 * Modular confetti celebration component
 * Because successful deployments deserve a PARTY! 🎉
 */
'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

/**
 * Spectacular confetti celebration for publish success
 * Master Jedi Barney deserves the BEST celebration!
 */
export function ConfettiCelebration({ trigger, onComplete }: ConfettiCelebrationProps) {
  useEffect(() => {
    if (!trigger) return;
    
    // Duration of the celebration
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    
    // Random colors for variety
    const colors = ['#a855f7', '#ec4899', '#10b981', '#3b82f6', '#f59e0b'];
    
    const runAnimation = () => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        onComplete?.();
        return;
      }
      
      // Multiple confetti bursts from different positions
      const particleCount = 50 * (timeLeft / duration);
      
      // Left side burst
      confetti({
        particleCount: particleCount / 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
        gravity: 0.8,
        scalar: 1.2,
        drift: 0.5,
      });
      
      // Right side burst
      confetti({
        particleCount: particleCount / 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
        gravity: 0.8,
        scalar: 1.2,
        drift: -0.5,
      });
      
      // Center explosions
      if (Math.random() > 0.5) {
        confetti({
          particleCount: particleCount / 3,
          angle: 90,
          spread: 180,
          origin: { x: 0.5, y: 0.4 },
          colors: colors,
          startVelocity: 45,
          gravity: 1.2,
          scalar: 1,
          shapes: ['circle', 'square'],
        });
      }
      
      // Keep the party going
      requestAnimationFrame(runAnimation);
    };
    
    // Start the celebration!
    runAnimation();
    
  }, [trigger, onComplete]);
  
  // This component doesn't render anything visible
  return null;
}

/**
 * Trigger a quick confetti burst programmatically
 * For those one-off celebration moments
 */
export function triggerConfettiBurst() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };
  
  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      scalar: 1.5,
      shapes: ['star', 'circle', 'square'],
    });
  }
  
  // Epic center burst
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    origin: { x: 0.5, y: 0.5 },
  });
  
  fire(0.2, {
    spread: 60,
    origin: { x: 0.5, y: 0.5 },
  });
  
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    origin: { x: 0.5, y: 0.5 },
  });
  
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    origin: { x: 0.5, y: 0.5 },
  });
  
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.5 },
  });
}

/**
 * Trigger an EPIC fireworks display
 * For when you REALLY want to celebrate!
 */
export function triggerFireworks() {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }
    
    const particleCount = 50 * (timeLeft / duration);
    
    confetti({
      particleCount: particleCount,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: {
        x: Math.random(),
        // Start higher for fireworks effect
        y: Math.random() * 0.5,
      },
      colors: colors,
      shapes: ['star', 'circle'],
      gravity: 1.5,
      scalar: 1.2,
    });
  }, 250);
}
