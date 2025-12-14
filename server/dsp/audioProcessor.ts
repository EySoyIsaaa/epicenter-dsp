/**
 * Audio Processor
 * Procesa archivos de audio aplicando el efecto Epicenter
 */

import {
  DSPParams,
  AudioInfo,
  calculateQFactor,
  calculateCutoffFreq,
  calculateFilterOrder,
  generateButterworthCoeffs,
  applyFilter,
  hanningWindow,
  fft,
  ifft,
  generateSpectrumData,
  validateParams
} from './epicenterEngine';

const WINDOW_SIZE = 16384;
const HOP_SIZE = WINDOW_SIZE / 16;
const SUBHARMONIC_BOOST = 45.0;

/**
 * Extrae armónicos de la señal en el rango especificado
 */
function extractHarmonics(
  signal: Float32Array,
  sweepFreq: number,
  sampleRate: number
): Float32Array {
  const lowFreq = sweepFreq * 1.5;
  const highFreq = sweepFreq * 4;
  
  // Aplicar band-pass filter
  const { b: bLow, a: aLow } = generateButterworthCoeffs(highFreq, sampleRate, 4);
  const { b: bHigh, a: aHigh } = generateButterworthCoeffs(lowFreq, sampleRate, 4);
  
  // Low-pass primero
  let filtered = applyFilter(signal, bLow, aLow);
  
  // High-pass (invertir coeficientes)
  const bHighPass = bHigh.map((v, i) => i === 0 ? 1 - v : -v);
  filtered = applyFilter(filtered, bHighPass, aHigh);
  
  return filtered;
}

/**
 * Sintetiza subarmónicos masivos basado en el contenido armónico
 */
function synthesizeMassiveSubharmonics(
  harmonicSignal: Float32Array,
  sweepFreq: number,
  width: number,
  sampleRate: number
): Float32Array {
  const output = new Float32Array(harmonicSignal.length);
  const window = hanningWindow(WINDOW_SIZE);
  const qFactor = calculateQFactor(width);
  const bandwidth = sweepFreq / qFactor;
  
  const numWindows = Math.floor((harmonicSignal.length - WINDOW_SIZE) / HOP_SIZE) + 1;
  const overlapCount = new Float32Array(harmonicSignal.length);
  
  for (let w = 0; w < numWindows; w++) {
    const start = w * HOP_SIZE;
    const end = start + WINDOW_SIZE;
    
    if (end > harmonicSignal.length) break;
    
    // Extraer segmento con ventana
    const segment = new Float32Array(WINDOW_SIZE);
    const imag = new Float32Array(WINDOW_SIZE);
    
    for (let i = 0; i < WINDOW_SIZE; i++) {
      segment[i] = harmonicSignal[start + i] * window[i];
    }
    
    // FFT
    fft(segment, imag);
    
    // Calcular energía armónica
    const freqResolution = sampleRate / WINDOW_SIZE;
    let harmonicEnergy = 0;
    let harmonicCount = 0;
    
    for (let i = 0; i < WINDOW_SIZE / 2; i++) {
      const freq = i * freqResolution;
      if (freq >= sweepFreq * 1.5 && freq <= sweepFreq * 4) {
        harmonicEnergy += Math.sqrt(segment[i] * segment[i] + imag[i] * imag[i]);
        harmonicCount++;
      }
    }
    
    if (harmonicCount > 0) {
      harmonicEnergy /= harmonicCount;
    }
    
    // Sintetizar subarmónicos en el espectro
    const synthReal = new Float32Array(WINDOW_SIZE);
    const synthImag = new Float32Array(WINDOW_SIZE);
    
    // Generar fundamental en sweepFreq
    const centerBin = Math.round(sweepFreq / freqResolution);
    const bandwidthBins = Math.round(bandwidth / freqResolution);
    
    for (let i = Math.max(0, centerBin - bandwidthBins); i <= Math.min(WINDOW_SIZE / 2 - 1, centerBin + bandwidthBins); i++) {
      const freq = i * freqResolution;
      const distance = Math.abs(freq - sweepFreq);
      const gaussian = Math.exp(-(distance * distance) / (2 * (bandwidth / 2) * (bandwidth / 2)));
      
      const magnitude = Math.max(harmonicEnergy, 0.01) * gaussian * 250;
      const phase = Math.atan2(imag[i], segment[i]);
      
      synthReal[i] = magnitude * Math.cos(phase);
      synthImag[i] = magnitude * Math.sin(phase);
      
      // Mirror for negative frequencies
      if (i > 0 && i < WINDOW_SIZE / 2) {
        synthReal[WINDOW_SIZE - i] = synthReal[i];
        synthImag[WINDOW_SIZE - i] = -synthImag[i];
      }
    }
    
    // Sub-fundamental (sweepFreq / 2)
    const subBin = Math.round((sweepFreq / 2) / freqResolution);
    if (subBin > 0 && subBin < WINDOW_SIZE / 2) {
      const subMagnitude = harmonicEnergy * 100;
      synthReal[subBin] += subMagnitude;
      synthReal[WINDOW_SIZE - subBin] += subMagnitude;
    }
    
    // Segunda armónica
    const secondBin = Math.round((sweepFreq * 2) / freqResolution);
    if (secondBin > 0 && secondBin < WINDOW_SIZE / 2) {
      const secondMagnitude = harmonicEnergy * 100;
      synthReal[secondBin] += secondMagnitude;
      synthReal[WINDOW_SIZE - secondBin] += secondMagnitude;
    }
    
    // IFFT
    ifft(synthReal, synthImag);
    
    // Overlap-add
    for (let i = 0; i < WINDOW_SIZE; i++) {
      if (start + i < output.length) {
        output[start + i] += synthReal[i] * window[i];
        overlapCount[start + i] += window[i] * window[i];
      }
    }
  }
  
  // Normalizar overlap-add
  for (let i = 0; i < output.length; i++) {
    if (overlapCount[i] > 0.001) {
      output[i] /= overlapCount[i];
    }
  }
  
  // Aplicar boost masivo
  for (let i = 0; i < output.length; i++) {
    output[i] *= SUBHARMONIC_BOOST;
  }
  
  return output;
}

/**
 * Aplica filtro low-pass agresivo
 */
function applyAggressiveLowpass(
  signal: Float32Array,
  width: number,
  sampleRate: number
): Float32Array {
  const cutoffFreq = calculateCutoffFreq(width);
  const filterOrder = calculateFilterOrder(width);
  
  // Aplicar múltiples pasadas para orden efectivo mayor
  let filtered = signal;
  const passes = Math.ceil(filterOrder / 2);
  
  for (let p = 0; p < passes; p++) {
    const { b, a } = generateButterworthCoeffs(cutoffFreq, sampleRate, 2);
    filtered = applyFilter(filtered, b, a);
  }
  
  return filtered;
}

/**
 * Convierte audio estéreo a mono
 */
function stereoToMono(left: Float32Array, right: Float32Array): Float32Array {
  const mono = new Float32Array(left.length);
  for (let i = 0; i < left.length; i++) {
    mono[i] = (left[i] + right[i]) / 2;
  }
  return mono;
}

/**
 * Procesa audio con el efecto Epicenter
 */
export function processAudio(
  audioData: Float32Array[],
  sampleRate: number,
  params: DSPParams
): Float32Array[] {
  const validParams = validateParams(params);
  const { sweepFreq, width, intensity } = validParams;
  
  // Convertir a mono para análisis
  const mono = audioData.length > 1 
    ? stereoToMono(audioData[0], audioData[1])
    : audioData[0];
  
  // Extraer contenido armónico
  const harmonicSignal = extractHarmonics(mono, sweepFreq, sampleRate);
  
  // Generar subarmónicos masivos
  let subharmonics = synthesizeMassiveSubharmonics(
    harmonicSignal,
    sweepFreq,
    width,
    sampleRate
  );
  
  // Aplicar low-pass agresivo
  subharmonics = applyAggressiveLowpass(subharmonics, width, sampleRate);
  
  // Combinar con bajo original para coherencia
  const { b: bLow, a: aLow } = generateButterworthCoeffs(sweepFreq, sampleRate, 2);
  const originalBass = applyFilter(mono, bLow, aLow);
  
  for (let i = 0; i < subharmonics.length; i++) {
    subharmonics[i] = originalBass[i] * 0.3 + subharmonics[i];
  }
  
  // Mezclar con original según intensity
  const intensityFactor = intensity / 100;
  const output: Float32Array[] = [];
  
  for (let ch = 0; ch < audioData.length; ch++) {
    const channelOutput = new Float32Array(audioData[ch].length);
    
    for (let i = 0; i < channelOutput.length; i++) {
      channelOutput[i] = 
        audioData[ch][i] * (1 - intensityFactor * 0.7) +
        subharmonics[i] * intensityFactor;
    }
    
    output.push(channelOutput);
  }
  
  // Normalizar para prevenir clipping
  let maxVal = 0;
  for (const channel of output) {
    for (let i = 0; i < channel.length; i++) {
      maxVal = Math.max(maxVal, Math.abs(channel[i]));
    }
  }
  
  if (maxVal > 0.95) {
    const scale = 0.95 / maxVal;
    for (const channel of output) {
      for (let i = 0; i < channel.length; i++) {
        channel[i] *= scale;
      }
    }
  }
  
  return output;
}

/**
 * Genera datos de espectro para visualización comparativa
 */
export function generateComparisonSpectrum(
  originalData: Float32Array[],
  processedData: Float32Array[],
  sampleRate: number
): {
  original: { frequencies: number[]; magnitudes: number[] };
  processed: { frequencies: number[]; magnitudes: number[] };
} {
  const originalMono = originalData.length > 1
    ? stereoToMono(originalData[0], originalData[1])
    : originalData[0];
    
  const processedMono = processedData.length > 1
    ? stereoToMono(processedData[0], processedData[1])
    : processedData[0];
  
  return {
    original: generateSpectrumData(originalMono, sampleRate, 64),
    processed: generateSpectrumData(processedMono, sampleRate, 64)
  };
}

export { generateSpectrumData };
