/**
 * THE MOST EPIC FUCKING CELEBRATION EVER!
 * MARIO, LUIGI, CONFETTI, FLASHING COLORS - THE WORKS!
 */
'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { MarioSprite, LuigiSprite } from './mario-luigi-sprites';

interface EpicPublishCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function EpicPublishCelebration({ trigger, onComplete }: EpicPublishCelebrationProps) {
  const [showMario, setShowMario] = useState(false);
  const [showLuigi, setShowLuigi] = useState(false);
  const [flashColors, setFlashColors] = useState(false);
  
  useEffect(() => {
    if (!trigger) return;
    
    console.log('🎉 EPIC CELEBRATION TRIGGERED!');
    
    // Start EVERYTHING!
    setShowMario(true);
    setShowLuigi(true);
    setFlashColors(true);
    
    // MASSIVE CONFETTI EXPLOSION
    const shootConfetti = () => {
      const duration = 8000; // 8 seconds of pure madness
      const animationEnd = Date.now() + duration;
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'];
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }
        
        // CONFETTI FROM EVERYWHERE!
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 100,
          origin: { x: 0, y: 0.6 },
          colors: colors,
          shapes: ['star', 'circle', 'square'],
          scalar: 2,
          gravity: 0.8,
        });
        
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 100,
          origin: { x: 1, y: 0.6 },
          colors: colors,
          shapes: ['star', 'circle', 'square'],
          scalar: 2,
          gravity: 0.8,
        });
        
        // Random explosions
        confetti({
          particleCount: 100,
          startVelocity: 45,
          spread: 360,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2,
          },
          colors: colors,
          shapes: ['star'],
          gravity: 1,
          scalar: 1.5,
        });
      }, 150);
      
      // Extra bursts
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            startVelocity: 30,
            spread: 360,
            ticks: 100,
            origin: {
              x: Math.random(),
              y: Math.random() - 0.1,
            },
            colors: colors,
            shapes: ['star', 'circle', 'square'],
            gravity: 0.5,
            scalar: 2,
          });
        }, i * 300);
      }
    };
    
    shootConfetti();
    
    // Clean up after 10 seconds
    const cleanup = setTimeout(() => {
      console.log('🎉 CELEBRATION COMPLETE - TRIGGERING DASHBOARD!');
      setShowMario(false);
      setShowLuigi(false);
      setFlashColors(false);
      onComplete?.();
    }, 10000);
    
    return () => {
      clearTimeout(cleanup);
    };
  }, [trigger, onComplete]);
  
  if (!trigger) return null;
  
  return (
    <>
      {/* FLASHING BACKGROUND COLORS */}
      {flashColors && (
        <div 
          className="fixed inset-0 pointer-events-none z-[9998]"
          style={{
            animation: 'rainbow-flash 0.5s linear infinite',
          }}
        />
      )}
      
      {/* MARIO RUNNING ACROSS */}
      {showMario && (
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{
            bottom: '20%',
            animation: 'mario-run 3s linear infinite',
          }}
        >
          <div className="relative scale-[3]">
            <div 
              style={{
                animation: 'jump 0.5s ease-in-out infinite',
                filter: 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.8))',
              }}
            >
              <MarioSprite />
            </div>
            <div className="absolute -top-8 left-0 text-sm font-bold text-red-600 animate-pulse whitespace-nowrap">
              IT'S-A ME!
            </div>
          </div>
        </div>
      )}
      
      {/* LUIGI RUNNING ACROSS (OPPOSITE DIRECTION) */}
      {showLuigi && (
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{
            bottom: '40%',
            animation: 'luigi-run 2.5s linear infinite',
          }}
        >
          <div className="relative scale-[3] transform scale-x-[-1]">
            <div 
              style={{
                animation: 'jump 0.6s ease-in-out infinite',
                filter: 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.8))',
              }}
            >
              <LuigiSprite />
            </div>
            <div className="absolute -top-8 left-0 text-sm font-bold text-green-600 animate-pulse transform scale-x-[-1] whitespace-nowrap">
              WAHOO!
            </div>
          </div>
        </div>
      )}
      
      {/* SUCCESS MESSAGE */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-none">
        <div 
          className="text-8xl font-bold animate-bounce"
          style={{
            animation: 'mega-pulse 0.5s ease-in-out infinite',
            background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ffff00, #ff00ff, #00ffff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
          }}
        >
          PUBLISHED! 🎉
        </div>
      </div>
      
      {/* CSS ANIMATIONS */}
      <style jsx>{`
        @keyframes rainbow-flash {
          0% { background-color: rgba(255, 0, 0, 0.2); }
          16% { background-color: rgba(255, 165, 0, 0.2); }
          33% { background-color: rgba(255, 255, 0, 0.2); }
          50% { background-color: rgba(0, 255, 0, 0.2); }
          66% { background-color: rgba(0, 0, 255, 0.2); }
          83% { background-color: rgba(75, 0, 130, 0.2); }
          100% { background-color: rgba(238, 130, 238, 0.2); }
        }
        
        @keyframes mario-run {
          from {
            left: -200px;
          }
          to {
            left: 100%;
          }
        }
        
        @keyframes luigi-run {
          from {
            right: -200px;
          }
          to {
            right: 100%;
          }
        }
        
        @keyframes jump {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        
        @keyframes mega-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
          }
        }
      `}</style>
    </>
  );
}
