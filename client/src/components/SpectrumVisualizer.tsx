import { useEffect, useRef } from 'react';

interface SpectrumData {
  frequencies: number[];
  magnitudes: number[];
}

interface SpectrumVisualizerProps {
  originalData?: SpectrumData;
  processedData?: SpectrumData;
  width?: number;
  height?: number;
  showLegend?: boolean;
}

export function SpectrumVisualizer({
  originalData,
  processedData,
  width = 600,
  height = 200,
  showLegend = true,
}: SpectrumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;

    // Vertical grid lines (frequency)
    const freqLabels = [20, 50, 100, 200, 500, 1000, 2000, 5000];
    freqLabels.forEach(freq => {
      const x = freqToX(freq, width);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 20);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#444';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(freq >= 1000 ? `${freq / 1000}k` : `${freq}`, x, height - 5);
    });

    // Horizontal grid lines (dB)
    const dbLevels = [0, -10, -20, -30, -40];
    dbLevels.forEach(db => {
      const y = dbToY(db, height - 20);
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#444';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${db}dB`, 28, y + 3);
    });

    // Draw original spectrum
    if (originalData && originalData.frequencies.length > 0) {
      drawSpectrum(ctx, originalData, width, height - 20, '#3b82f6', 0.6);
    }

    // Draw processed spectrum
    if (processedData && processedData.frequencies.length > 0) {
      drawSpectrum(ctx, processedData, width, height - 20, '#ef4444', 0.8);
    }

    // Draw frequency highlight zone (sub-bass region)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    const x1 = freqToX(20, width);
    const x2 = freqToX(80, width);
    ctx.fillRect(x1, 0, x2 - x1, height - 20);

    // Label for sub-bass zone
    ctx.fillStyle = '#ef4444';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SUB-BASS', (x1 + x2) / 2, 15);

  }, [originalData, processedData, width, height]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{ width, height }}
        className="rounded-lg border border-zinc-800"
      />
      {showLegend && (
        <div className="absolute top-2 right-2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-500 opacity-60" />
            <span className="text-zinc-400">Original</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500 opacity-80" />
            <span className="text-zinc-400">Procesado</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Convert frequency to X position (logarithmic scale)
function freqToX(freq: number, width: number): number {
  const minFreq = 20;
  const maxFreq = 20000;
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);
  const logFreq = Math.log10(Math.max(minFreq, Math.min(maxFreq, freq)));
  return 30 + ((logFreq - logMin) / (logMax - logMin)) * (width - 30);
}

// Convert dB to Y position
function dbToY(db: number, height: number): number {
  const minDb = -50;
  const maxDb = 10;
  const normalized = (db - minDb) / (maxDb - minDb);
  return height - normalized * height;
}

// Draw spectrum curve
function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  data: SpectrumData,
  width: number,
  height: number,
  color: string,
  alpha: number
) {
  if (data.frequencies.length === 0) return;

  // Normalize magnitudes to dB
  const maxMag = Math.max(...data.magnitudes, 0.001);
  const dbValues = data.magnitudes.map(m => 
    20 * Math.log10(Math.max(m / maxMag, 0.0001))
  );

  // Draw filled area
  ctx.beginPath();
  ctx.moveTo(freqToX(data.frequencies[0], width), height);

  for (let i = 0; i < data.frequencies.length; i++) {
    const x = freqToX(data.frequencies[i], width);
    const y = dbToY(dbValues[i], height);
    
    if (i === 0) {
      ctx.lineTo(x, y);
    } else {
      // Smooth curve using quadratic bezier
      const prevX = freqToX(data.frequencies[i - 1], width);
      const prevY = dbToY(dbValues[i - 1], height);
      const cpX = (prevX + x) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
    }
  }

  const lastX = freqToX(data.frequencies[data.frequencies.length - 1], width);
  ctx.lineTo(lastX, height);
  ctx.closePath();

  // Fill gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
  gradient.addColorStop(1, color.replace(')', ', 0.1)').replace('rgb', 'rgba'));
  
  ctx.fillStyle = `${color}${Math.round(alpha * 40).toString(16).padStart(2, '0')}`;
  ctx.fill();

  // Draw line
  ctx.beginPath();
  for (let i = 0; i < data.frequencies.length; i++) {
    const x = freqToX(data.frequencies[i], width);
    const y = dbToY(dbValues[i], height);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

export default SpectrumVisualizer;
