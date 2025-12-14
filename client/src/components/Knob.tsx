import { useRef, useState, useCallback, useEffect } from 'react';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
  size?: number;
  color?: string;
  disabled?: boolean;
}

export function Knob({
  value,
  min,
  max,
  onChange,
  label,
  unit = '',
  size = 120,
  color = '#ef4444',
  disabled = false,
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(value);

  // Convert value to rotation angle (-135 to 135 degrees)
  const valueToAngle = (val: number) => {
    const normalized = (val - min) / (max - min);
    return -135 + normalized * 270;
  };

  const angle = valueToAngle(value);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
  }, [value, disabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || disabled) return;
    
    const deltaY = startY.current - e.clientY;
    const sensitivity = (max - min) / 150;
    const newValue = Math.max(min, Math.min(max, startValue.current + deltaY * sensitivity));
    
    onChange(Math.round(newValue * 10) / 10);
  }, [isDragging, min, max, onChange, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startValue.current = value;
  }, [value, disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || disabled) return;
    e.preventDefault();
    
    const deltaY = startY.current - e.touches[0].clientY;
    const sensitivity = (max - min) / 150;
    const newValue = Math.max(min, Math.min(max, startValue.current + deltaY * sensitivity));
    
    onChange(Math.round(newValue * 10) / 10);
  }, [isDragging, min, max, onChange, disabled]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleTouchMove, handleMouseUp]);

  // Generate tick marks
  const ticks = [];
  const numTicks = 11;
  for (let i = 0; i < numTicks; i++) {
    const tickAngle = -135 + (i / (numTicks - 1)) * 270;
    const isMain = i % 2 === 0;
    ticks.push(
      <div
        key={i}
        className="absolute"
        style={{
          width: isMain ? '3px' : '2px',
          height: isMain ? '10px' : '6px',
          backgroundColor: isMain ? '#666' : '#444',
          left: '50%',
          top: '8px',
          transformOrigin: `50% ${size / 2 - 8}px`,
          transform: `translateX(-50%) rotate(${tickAngle}deg)`,
        }}
      />
    );
  }

  return (
    <div 
      className="flex flex-col items-center select-none"
      style={{ width: size + 40 }}
    >
      {/* Label */}
      <div className="text-xs font-bold tracking-wider text-zinc-400 mb-2 uppercase">
        {label}
      </div>

      {/* Knob container */}
      <div 
        ref={knobRef}
        className="relative cursor-pointer"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Tick marks */}
        {ticks}

        {/* Outer ring glow */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}20, transparent 70%)`,
            boxShadow: isDragging ? `0 0 20px ${color}40` : 'none',
            transition: 'box-shadow 0.2s',
          }}
        />

        {/* Outer ring */}
        <div
          className="absolute inset-3 rounded-full"
          style={{
            background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
          }}
        />

        {/* Inner knob */}
        <div
          className="absolute rounded-full"
          style={{
            inset: size * 0.15,
            background: 'linear-gradient(145deg, #3a3a3a, #252525)',
            boxShadow: `
              inset 0 -2px 4px rgba(0,0,0,0.4),
              inset 0 2px 4px rgba(255,255,255,0.05),
              0 4px 12px rgba(0,0,0,0.4)
            `,
            transform: `rotate(${angle}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {/* Indicator line */}
          <div
            className="absolute left-1/2 top-2"
            style={{
              width: '4px',
              height: size * 0.18,
              backgroundColor: color,
              transform: 'translateX(-50%)',
              borderRadius: '2px',
              boxShadow: `0 0 8px ${color}`,
            }}
          />

          {/* Center cap */}
          <div
            className="absolute rounded-full"
            style={{
              inset: '30%',
              background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)',
            }}
          />
        </div>
      </div>

      {/* Value display */}
      <div 
        className="mt-3 px-3 py-1 rounded-md text-center"
        style={{
          background: 'linear-gradient(180deg, #1a1a1a, #0f0f0f)',
          border: '1px solid #333',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
          minWidth: '80px',
        }}
      >
        <span 
          className="font-mono text-lg font-bold"
          style={{ color }}
        >
          {typeof value === 'number' ? value.toFixed(0) : value}
        </span>
        <span className="text-zinc-500 text-sm ml-1">{unit}</span>
      </div>
    </div>
  );
}

export default Knob;
