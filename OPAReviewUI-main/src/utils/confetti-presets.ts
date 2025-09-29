/**
 * Confetti presets for different celebration levels
 * Because Master Jedi deserves variety in celebrations!
 */
import confetti from 'canvas-confetti';

/**
 * Golden shower of success
 * Premium celebration for major achievements
 */
export function goldenShower() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }
    
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
      gravity: 0.3,
      drift: 1,
      scalar: 1.5,
      shapes: ['star'],
    });
    
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
      gravity: 0.3,
      drift: -1,
      scalar: 1.5,
      shapes: ['star'],
    });
  }, 40);
}

/**
 * Pride celebration - rainbow confetti
 * For when you're proud of what you've accomplished
 */
export function prideExplosion() {
  const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
  const end = Date.now() + 2000;
  
  (function frame() {
    confetti({
      particleCount: 6,
      angle: 90,
      spread: 360,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: colors,
      shapes: ['circle', 'square'],
      gravity: 0.8,
      scalar: 1.2,
    });
    
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

/**
 * Matrix rain - green digital confetti
 * For when you've hacked the system
 */
export function matrixRain() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }
    
    confetti({
      particleCount: 2,
      angle: 270,
      spread: 60,
      origin: { 
        x: Math.random(),
        y: -0.1 
      },
      colors: ['#00ff00', '#00cc00', '#009900'],
      gravity: 0.5,
      drift: 0,
      scalar: 0.8,
      shapes: ['square'],
      ticks: 300,
    });
  }, 50);
}

/**
 * Cannon blast from the corners
 * Maximum impact celebration
 */
export function cannonBlast() {
  const count = 200;
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.5,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#a855f7', '#ec4899', '#10b981', '#3b82f6', '#f59e0b'],
  };
  
  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
      origin: { x: 0, y: 0 },
    });
    
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
      origin: { x: 1, y: 0 },
    });
    
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['circle'],
      origin: { x: 0, y: 1 },
    });
    
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['circle'],
      origin: { x: 1, y: 1 },
    });
  }
  
  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}

/**
 * Realistic snow fall
 * For a more subtle, elegant celebration
 */
export function snowfall() {
  const duration = 5000;
  const animationEnd = Date.now() + duration;
  let skew = 1;
  
  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  
  (function frame() {
    const timeLeft = animationEnd - Date.now();
    const ticks = Math.max(200, 500 * (timeLeft / duration));
    skew = Math.max(0.8, skew - 0.001);
    
    confetti({
      particleCount: 1,
      startVelocity: 0,
      ticks: ticks,
      origin: {
        x: Math.random(),
        y: (Math.random() * skew) - 0.2,
      },
      colors: ['#ffffff', '#e8f5ff', '#cfe8ff'],
      shapes: ['circle'],
      gravity: randomInRange(0.4, 0.6),
      scalar: randomInRange(0.4, 1),
      drift: randomInRange(-0.4, 0.4),
    });
    
    if (timeLeft > 0) {
      requestAnimationFrame(frame);
    }
  }());
}

/**
 * Epic finale - everything at once!
 * For when you REALLY need to celebrate
 */
export function epicFinale() {
  // Start with cannon blasts
  cannonBlast();
  
  // Add golden shower after 500ms
  setTimeout(() => goldenShower(), 500);
  
  // Pride explosion at 1s
  setTimeout(() => prideExplosion(), 1000);
  
  // Finish with fireworks
  setTimeout(() => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      
      confetti({
        particleCount: 50,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
        colors: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#00FA9A'],
        shapes: ['star', 'circle'],
        gravity: 1,
        scalar: 1.5,
      });
    }, 200);
  }, 2000);
}
