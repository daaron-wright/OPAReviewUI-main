/**
 * MARIO AND LUIGI SPRITES - 8-BIT STYLE!
 * Because emojis aren't good enough for Master Jedi!
 */
'use client';

export function MarioSprite({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Mario's Body */}
      <div className="relative w-16 h-20">
        {/* Hat */}
        <div className="absolute top-0 left-2 w-12 h-4 bg-red-600 rounded-t-full" />
        
        {/* Head */}
        <div className="absolute top-3 left-3 w-10 h-6 bg-yellow-100 rounded-full" />
        
        {/* Eyes */}
        <div className="absolute top-4 left-5 w-1.5 h-1.5 bg-black rounded-full" />
        <div className="absolute top-4 left-8 w-1.5 h-1.5 bg-black rounded-full" />
        
        {/* Mustache */}
        <div className="absolute top-6 left-4 w-8 h-1 bg-black rounded-full" />
        
        {/* Body */}
        <div className="absolute top-8 left-2 w-12 h-6 bg-red-600 rounded" />
        
        {/* Arms */}
        <div className="absolute top-9 left-0 w-2 h-4 bg-yellow-100 rounded" />
        <div className="absolute top-9 right-0 w-2 h-4 bg-yellow-100 rounded" />
        
        {/* Overalls */}
        <div className="absolute top-11 left-3 w-10 h-4 bg-blue-600 rounded" />
        
        {/* Legs */}
        <div className="absolute bottom-0 left-3 w-3 h-3 bg-blue-600 rounded" />
        <div className="absolute bottom-0 right-3 w-3 h-3 bg-blue-600 rounded" />
        
        {/* Shoes */}
        <div className="absolute bottom-0 left-2 w-4 h-2 bg-brown-600 rounded" style={{ backgroundColor: '#8B4513' }} />
        <div className="absolute bottom-0 right-2 w-4 h-2 bg-brown-600 rounded" style={{ backgroundColor: '#8B4513' }} />
      </div>
      
      {/* "M" on hat */}
      <div className="absolute top-1 left-6 text-white font-bold text-xs">M</div>
    </div>
  );
}

export function LuigiSprite({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Luigi's Body (Taller than Mario) */}
      <div className="relative w-16 h-24">
        {/* Hat */}
        <div className="absolute top-0 left-2 w-12 h-4 bg-green-600 rounded-t-full" />
        
        {/* Head */}
        <div className="absolute top-3 left-3 w-10 h-6 bg-yellow-100 rounded-full" />
        
        {/* Eyes */}
        <div className="absolute top-4 left-5 w-1.5 h-1.5 bg-black rounded-full" />
        <div className="absolute top-4 left-8 w-1.5 h-1.5 bg-black rounded-full" />
        
        {/* Mustache */}
        <div className="absolute top-6 left-4 w-8 h-1 bg-black rounded-full" />
        
        {/* Body (Longer) */}
        <div className="absolute top-8 left-2 w-12 h-8 bg-green-600 rounded" />
        
        {/* Arms */}
        <div className="absolute top-9 left-0 w-2 h-5 bg-yellow-100 rounded" />
        <div className="absolute top-9 right-0 w-2 h-5 bg-yellow-100 rounded" />
        
        {/* Overalls */}
        <div className="absolute top-13 left-3 w-10 h-5 bg-blue-600 rounded" />
        
        {/* Legs (Longer) */}
        <div className="absolute bottom-0 left-3 w-3 h-4 bg-blue-600 rounded" />
        <div className="absolute bottom-0 right-3 w-3 h-4 bg-blue-600 rounded" />
        
        {/* Shoes */}
        <div className="absolute bottom-0 left-2 w-4 h-2 bg-brown-600 rounded" style={{ backgroundColor: '#8B4513' }} />
        <div className="absolute bottom-0 right-2 w-4 h-2 bg-brown-600 rounded" style={{ backgroundColor: '#8B4513' }} />
      </div>
      
      {/* "L" on hat */}
      <div className="absolute top-1 left-6 text-white font-bold text-xs">L</div>
    </div>
  );
}
