/**
 * Epicenter DSP Engine
 * Implementa síntesis de subarmónicos masivos basado en la patente US4698842
 * Simula el comportamiento del AudioControl Epicenter para car audio
 */

export interface DSPParams {
  sweepFreq: number;  // 27-63 Hz - frecuencia central de restauración
  width: number;      // 0-100% - ancho de banda (Q factor)
  intensity: number;  // 0-100% - cantidad de efecto
}

export interface AudioInfo {
  sampleRate: number;
  duration: number;
  channels: number;
  format: string;
}

// Constantes del algoritmo calibradas con hardware real
const WINDOW_SIZE = 16384;
const HOP_SIZE = WINDOW_SIZE / 16;
const SUBHARMONIC_BOOST = 45.0;
const SYNTHESIS_BOOST = 250.0;

/**
 * Calcula el Q factor basado en el parámetro WIDTH
 * WIDTH bajo = Q alto (estrecho), WIDTH alto = Q bajo (amplio)
 */
export function calculateQFactor(width: number): number {
  return 2.0 + (100 - width) / 20.0; // Q: 2.0 a 7.0
}

/**
 * Calcula la frecuencia de corte del low-pass basado en WIDTH
 */
export function calculateCutoffFreq(width: number): number {
  return 55 + (width * 0.35); // 55-90 Hz
}

/**
 * Calcula el orden del filtro basado en WIDTH
 */
export function calculateFilterOrder(width: number): number {
  const order = Math.floor(10 - (width / 100.0) * 4);
  return Math.max(6, Math.min(10, order));
}

/**
 * Genera coeficientes de filtro Butterworth low-pass
 */
export function generateButterworthCoeffs(
  cutoffFreq: number,
  sampleRate: number,
  order: number
): { b: number[]; a: number[] } {
  const nyquist = sampleRate / 2;
  const normalizedCutoff = cutoffFreq / nyquist;
  
  // Coeficientes simplificados para filtro de segundo orden
  const omega = Math.tan(Math.PI * normalizedCutoff);
  const omega2 = omega * omega;
  const sqrt2 = Math.sqrt(2);
  
  const denom = 1 + sqrt2 * omega + omega2;
  
  const b = [
    omega2 / denom,
    2 * omega2 / denom,
    omega2 / denom
  ];
  
  const a = [
    1,
    2 * (omega2 - 1) / denom,
    (1 - sqrt2 * omega + omega2) / denom
  ];
  
  return { b, a };
}

/**
 * Aplica filtro IIR a una señal
 */
export function applyFilter(
  signal: Float32Array,
  b: number[],
  a: number[]
): Float32Array {
  const output = new Float32Array(signal.length);
  const order = Math.max(b.length, a.length) - 1;
  
  const x = new Array(order + 1).fill(0);
  const y = new Array(order + 1).fill(0);
  
  for (let i = 0; i < signal.length; i++) {
    // Shift x buffer
    for (let j = order; j > 0; j--) {
      x[j] = x[j - 1];
    }
    x[0] = signal[i];
    
    // Calculate output
    let sum = 0;
    for (let j = 0; j < b.length; j++) {
      sum += b[j] * x[j];
    }
    for (let j = 1; j < a.length; j++) {
      sum -= a[j] * y[j - 1];
    }
    
    // Shift y buffer
    for (let j = order; j > 0; j--) {
      y[j] = y[j - 1];
    }
    y[0] = sum;
    
    output[i] = sum;
  }
  
  return output;
}

/**
 * Genera ventana Hanning
 */
export function hanningWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
  }
  return window;
}

/**
 * FFT simplificada usando algoritmo Cooley-Tukey
 */
export function fft(real: Float32Array, imag: Float32Array): void {
  const n = real.length;
  
  // Bit-reversal permutation
  for (let i = 0, j = 0; i < n; i++) {
    if (j > i) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
    let m = n >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }
  
  // Cooley-Tukey FFT
  for (let size = 2; size <= n; size *= 2) {
    const halfSize = size / 2;
    const angle = -2 * Math.PI / size;
    
    for (let i = 0; i < n; i += size) {
      for (let j = 0; j < halfSize; j++) {
        const cos = Math.cos(angle * j);
        const sin = Math.sin(angle * j);
        
        const idx1 = i + j;
        const idx2 = i + j + halfSize;
        
        const tReal = real[idx2] * cos - imag[idx2] * sin;
        const tImag = real[idx2] * sin + imag[idx2] * cos;
        
        real[idx2] = real[idx1] - tReal;
        imag[idx2] = imag[idx1] - tImag;
        real[idx1] = real[idx1] + tReal;
        imag[idx1] = imag[idx1] + tImag;
      }
    }
  }
}

/**
 * IFFT
 */
export function ifft(real: Float32Array, imag: Float32Array): void {
  // Conjugate
  for (let i = 0; i < imag.length; i++) {
    imag[i] = -imag[i];
  }
  
  fft(real, imag);
  
  // Conjugate and scale
  const n = real.length;
  for (let i = 0; i < n; i++) {
    real[i] /= n;
    imag[i] = -imag[i] / n;
  }
}

/**
 * Calcula la magnitud del espectro
 */
export function calculateMagnitude(real: Float32Array, imag: Float32Array): Float32Array {
  const magnitude = new Float32Array(real.length / 2);
  for (let i = 0; i < magnitude.length; i++) {
    magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
  }
  return magnitude;
}

/**
 * Genera datos de espectro para visualización
 */
export function generateSpectrumData(
  audioData: Float32Array,
  sampleRate: number,
  numBins: number = 128
): { frequencies: number[]; magnitudes: number[] } {
  const fftSize = 2048;
  const window = hanningWindow(fftSize);
  
  // Tomar una porción del audio para análisis
  const startIdx = Math.floor(audioData.length / 4);
  const segment = new Float32Array(fftSize);
  const imag = new Float32Array(fftSize);
  
  for (let i = 0; i < fftSize && startIdx + i < audioData.length; i++) {
    segment[i] = audioData[startIdx + i] * window[i];
  }
  
  fft(segment, imag);
  
  const magnitude = calculateMagnitude(segment, imag);
  
  // Reducir a numBins para visualización
  const frequencies: number[] = [];
  const magnitudes: number[] = [];
  const binSize = Math.floor(magnitude.length / numBins);
  
  for (let i = 0; i < numBins; i++) {
    const startBin = i * binSize;
    const endBin = Math.min(startBin + binSize, magnitude.length);
    
    let sum = 0;
    for (let j = startBin; j < endBin; j++) {
      sum += magnitude[j];
    }
    
    const freq = (startBin + binSize / 2) * sampleRate / fftSize;
    frequencies.push(freq);
    magnitudes.push(sum / binSize);
  }
  
  return { frequencies, magnitudes };
}

/**
 * Información de presets por género
 */
export const GENRE_PRESETS: Record<string, DSPParams & { description: string }> = {
  regional: {
    sweepFreq: 42,
    width: 70,
    intensity: 80,
    description: "Regional Mexicano / Banda / Corridos - Boost agresivo para géneros con poco bajo natural"
  },
  rock: {
    sweepFreq: 47,
    width: 55,
    intensity: 68,
    description: "Rock / Metal - Intensidad moderada para no saturar"
  },
  pop: {
    sweepFreq: 44,
    width: 45,
    intensity: 58,
    description: "Pop / Baladas - Enfoque moderado, preserva claridad vocal"
  },
  classical: {
    sweepFreq: 37,
    width: 35,
    intensity: 48,
    description: "Música Clásica - Restauración sutil, respeto a la mezcla original"
  },
  custom: {
    sweepFreq: 45,
    width: 50,
    intensity: 50,
    description: "Configuración personalizada"
  }
};

/**
 * Valida y normaliza los parámetros DSP
 */
export function validateParams(params: Partial<DSPParams>): DSPParams {
  return {
    sweepFreq: Math.max(27, Math.min(63, params.sweepFreq ?? 45)),
    width: Math.max(0, Math.min(100, params.width ?? 50)),
    intensity: Math.max(0, Math.min(100, params.intensity ?? 50))
  };
}
