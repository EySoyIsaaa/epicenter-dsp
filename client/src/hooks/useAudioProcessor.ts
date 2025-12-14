import { useState, useCallback, useRef } from 'react';
import { createMp3Blob } from '@/utils/mp3Encoder';

interface DSPParams {
  sweepFreq: number;
  width: number;
  intensity: number;
  balance: number;
}

interface AudioFileInfo {
  file: File;
  name: string;
  format: string;
  size: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
}

interface ProcessingResult {
  originalUrl: string;
  processedUrl: string;
  originalData: Float32Array[];
  processedData: Float32Array[];
  sampleRate: number;
  originalFileName: string;
}

interface SpectrumData {
  frequencies: number[];
  magnitudes: number[];
}

// Filtro Biquad IIR
function applyBiquadFilter(
  signal: Float32Array,
  cutoffFreq: number,
  sampleRate: number,
  type: 'lowpass' | 'highpass' | 'bandpass',
  Q: number = 1.0
): Float32Array {
  const output = new Float32Array(signal.length);
  const omega = 2 * Math.PI * cutoffFreq / sampleRate;
  const sinOmega = Math.sin(omega);
  const cosOmega = Math.cos(omega);
  const alpha = sinOmega / (2 * Q);

  let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;

  if (type === 'lowpass') {
    b0 = (1 - cosOmega) / 2;
    b1 = 1 - cosOmega;
    b2 = (1 - cosOmega) / 2;
  } else if (type === 'highpass') {
    b0 = (1 + cosOmega) / 2;
    b1 = -(1 + cosOmega);
    b2 = (1 + cosOmega) / 2;
  } else {
    b0 = alpha;
    b1 = 0;
    b2 = -alpha;
  }
  
  a0 = 1 + alpha;
  a1 = -2 * cosOmega;
  a2 = 1 - alpha;

  b0 /= a0; b1 /= a0; b2 /= a0;
  a1 /= a0; a2 /= a0;

  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

  for (let i = 0; i < signal.length; i++) {
    const x0 = signal[i];
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    output[i] = y0;
    x2 = x1; x1 = x0;
    y2 = y1; y1 = y0;
  }

  return output;
}

// Extraer envolvente de amplitud
function extractEnvelope(signal: Float32Array, sampleRate: number): Float32Array {
  const rectified = new Float32Array(signal.length);
  
  // Rectificación de onda completa
  for (let i = 0; i < signal.length; i++) {
    rectified[i] = Math.abs(signal[i]);
  }
  
  // Filtro paso-bajo para suavizar envolvente (~20 Hz)
  return applyBiquadFilter(rectified, 20, sampleRate, 'lowpass', 0.5);
}

/**
 * ALGORITMO EPICENTER SEGÚN PATENTE US4698842
 * 
 * 1. Filtrar segundos armónicos (55-120 Hz)
 * 2. Convertir a onda cuadrada (comparador)
 * 3. Dividir frecuencia por 2 (flip-flop)
 * 4. Modular con envolvente original
 * 5. Filtrar paso-bajo
 * 6. Mezclar con original
 */
function processAudioData(
  audioData: Float32Array[],
  sampleRate: number,
  params: DSPParams
): Float32Array[] {
  const { sweepFreq, width, intensity, balance } = params;
  
  // Convertir a mono para procesamiento
  const mono = audioData.length > 1
    ? new Float32Array(audioData[0].length).map((_, i) => (audioData[0][i] + audioData[1][i]) / 2)
    : new Float32Array(audioData[0]);

  // ============================================
  // PASO 1: Filtro paso-banda para segundos armónicos
  // Según patente: 55-120 Hz
  // SWEEP ajusta la frecuencia central
  // ============================================
  
  // SWEEP 27-63 Hz → buscar armónicos en 54-126 Hz (el doble)
  const harmonicCenterFreq = sweepFreq * 2; // Segundo armónico
  const harmonicBandwidth = 30 + (width * 0.5); // WIDTH controla ancho
  const lowCutoff = Math.max(40, harmonicCenterFreq - harmonicBandwidth);
  const highCutoff = Math.min(200, harmonicCenterFreq + harmonicBandwidth);
  
  // Aplicar filtro paso-banda (lowpass + highpass)
  let secondHarmonics = applyBiquadFilter(mono, highCutoff, sampleRate, 'lowpass', 1.5);
  secondHarmonics = applyBiquadFilter(secondHarmonics, lowCutoff, sampleRate, 'highpass', 1.5);
  
  // ============================================
  // PASO 2: Extraer envolvente de los armónicos
  // ============================================
  const envelope = extractEnvelope(secondHarmonics, sampleRate);
  
  // ============================================
  // PASO 3: Generar fundamental (f/2) con Flip-Flop
  // ============================================
  const halfFreqSignal = new Float32Array(mono.length);
  let flipFlopState1 = 1;
  let lastSample1 = 0;
  
  for (let i = 0; i < secondHarmonics.length; i++) {
    const sample = secondHarmonics[i];
    if (lastSample1 <= 0 && sample > 0) {
      flipFlopState1 *= -1;
    }
    lastSample1 = sample;
    halfFreqSignal[i] = flipFlopState1 * envelope[i];
  }
  
  // ============================================
  // PASO 3b: Generar subarmónico profundo (f/4) con segundo Flip-Flop
  // Esto añade profundidad extra manteniendo coherencia armónica
  // ============================================
  const quarterFreqSignal = new Float32Array(mono.length);
  let flipFlopState2 = 1;
  let lastSample2 = 0;
  
  for (let i = 0; i < halfFreqSignal.length; i++) {
    const sample = halfFreqSignal[i];
    if (lastSample2 <= 0 && sample > 0) {
      flipFlopState2 *= -1;
    }
    lastSample2 = sample;
    quarterFreqSignal[i] = flipFlopState2 * envelope[i];
  }
  
  // ============================================
  // PASO 4: Filtrar y combinar armónicos
  // ============================================
  const smoothCutoff = sweepFreq * 1.5;
  const deepCutoff = sweepFreq * 0.8; // Más bajo para el subarmónico
  
  // Filtrar fundamental (f/2)
  let fundamentalBass = applyBiquadFilter(halfFreqSignal, smoothCutoff, sampleRate, 'lowpass', 0.707);
  fundamentalBass = applyBiquadFilter(fundamentalBass, smoothCutoff, sampleRate, 'lowpass', 0.707);
  
  // Filtrar subarmónico profundo (f/4)
  let deepBass = applyBiquadFilter(quarterFreqSignal, deepCutoff, sampleRate, 'lowpass', 0.5);
  deepBass = applyBiquadFilter(deepBass, deepCutoff, sampleRate, 'lowpass', 0.5);
  
  // Combinar: 60% fundamental + 40% subarmónico profundo
  const widthFactor = width / 100; // WIDTH controla mezcla de profundidad
  const fundamentalWeight = 0.6 - (widthFactor * 0.2); // 0.6 a 0.4
  const deepWeight = 0.4 + (widthFactor * 0.3); // 0.4 a 0.7
  
  let restoredBass = new Float32Array(mono.length);
  for (let i = 0; i < mono.length; i++) {
    restoredBass[i] = fundamentalBass[i] * fundamentalWeight + deepBass[i] * deepWeight;
  }
  
  // ============================================
  // PASO 5: Normalizar y aplicar ganancia
  // ============================================
  let maxBass = 0;
  for (let i = 0; i < restoredBass.length; i++) {
    maxBass = Math.max(maxBass, Math.abs(restoredBass[i]));
  }
  
  const bassGain = (intensity / 100) * 3.5; // INTENSITY controla amplitud (aumentado para más profundidad)
  if (maxBass > 0.001) {
    const normalize = 0.8 / maxBass;
    for (let i = 0; i < restoredBass.length; i++) {
      restoredBass[i] *= normalize * bassGain;
    }
  }
  
  // ============================================
  // PASO 6: Preparar canal de voz/medios
  // Filtro paso-alto para eliminar bajos originales
  // ============================================
  let voiceChannel = applyBiquadFilter(mono, 150, sampleRate, 'highpass', 0.707);
  
  // Normalizar voz
  let maxVoice = 0;
  for (let i = 0; i < voiceChannel.length; i++) {
    maxVoice = Math.max(maxVoice, Math.abs(voiceChannel[i]));
  }
  if (maxVoice > 0.001) {
    const voiceNormalize = 0.9 / maxVoice;
    for (let i = 0; i < voiceChannel.length; i++) {
      voiceChannel[i] *= voiceNormalize;
    }
  }
  
  // ============================================
  // PASO 7: Mezcla final con BALANCE
  // ============================================
  const balanceFactor = balance / 100;
  const voiceWeight = 1 - (balanceFactor * 0.7); // 1.0 a 0.3
  const bassWeight = 0.3 + (balanceFactor * 0.7); // 0.3 a 1.0
  
  const output: Float32Array[] = [];
  
  for (let ch = 0; ch < audioData.length; ch++) {
    const channelOutput = new Float32Array(audioData[ch].length);
    
    for (let i = 0; i < channelOutput.length; i++) {
      // Mezclar voz + bajo restaurado
      channelOutput[i] = voiceChannel[i] * voiceWeight + restoredBass[i] * bassWeight;
    }
    
    output.push(channelOutput);
  }
  
  // Normalizar para evitar clipping
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

function generateSpectrumData(
  audioData: Float32Array,
  sampleRate: number,
  numBins: number = 64
): SpectrumData {
  const fftSize = 2048;
  const startIdx = Math.floor(audioData.length / 4);
  
  const frequencies: number[] = [];
  const magnitudes: number[] = [];
  
  for (let k = 0; k < numBins; k++) {
    const freq = (k / numBins) * (sampleRate / 4);
    frequencies.push(freq);
    
    let real = 0, imag = 0;
    const binSize = Math.floor(fftSize / numBins);
    
    for (let n = 0; n < binSize && startIdx + n < audioData.length; n++) {
      const angle = 2 * Math.PI * n * k / fftSize;
      real += audioData[startIdx + n] * Math.cos(angle);
      imag += audioData[startIdx + n] * Math.sin(angle);
    }
    
    magnitudes.push(Math.sqrt(real * real + imag * imag));
  }

  return { frequencies, magnitudes };
}

function createWavBlob(audioData: Float32Array[], sampleRate: number): Blob {
  const numChannels = audioData.length;
  const length = audioData[0].length;
  const buffer = new ArrayBuffer(44 + length * numChannels * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numChannels * 2, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, audioData[ch][i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export function useAudioProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [originalSpectrum, setOriginalSpectrum] = useState<SpectrumData | null>(null);
  const [processedSpectrum, setProcessedSpectrum] = useState<SpectrumData | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const processAudio = useCallback(async (
    fileInfo: AudioFileInfo,
    params: DSPParams
  ) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const audioContext = audioContextRef.current;

      setProgress(10);

      const arrayBuffer = await fileInfo.file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      setProgress(30);

      const originalData: Float32Array[] = [];
      for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
        originalData.push(new Float32Array(audioBuffer.getChannelData(ch)));
      }

      const origMono = originalData.length > 1
        ? new Float32Array(originalData[0].length).map((_, i) => (originalData[0][i] + originalData[1][i]) / 2)
        : originalData[0];
      setOriginalSpectrum(generateSpectrumData(origMono, audioBuffer.sampleRate));

      setProgress(50);

      const processedData = processAudioData(
        originalData,
        audioBuffer.sampleRate,
        params
      );

      setProgress(80);

      const procMono = processedData.length > 1
        ? new Float32Array(processedData[0].length).map((_, i) => (processedData[0][i] + processedData[1][i]) / 2)
        : processedData[0];
      setProcessedSpectrum(generateSpectrumData(procMono, audioBuffer.sampleRate));

      const originalBlob = createMp3Blob(originalData, audioBuffer.sampleRate);
      const processedBlob = createMp3Blob(processedData, audioBuffer.sampleRate);

      const originalUrl = URL.createObjectURL(originalBlob);
      const processedUrl = URL.createObjectURL(processedBlob);

      setProgress(100);

      setResult({
        originalUrl,
        processedUrl,
        originalData,
        processedData,
        sampleRate: audioBuffer.sampleRate,
        originalFileName: fileInfo.name.replace(/\.[^/.]+$/, ''), // Remover extensión
      });

    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Error procesando el audio');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    if (result) {
      URL.revokeObjectURL(result.originalUrl);
      URL.revokeObjectURL(result.processedUrl);
    }
    setResult(null);
    setOriginalSpectrum(null);
    setProcessedSpectrum(null);
    setProgress(0);
    setError(null);
  }, [result]);

  const downloadProcessed = useCallback(() => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.processedUrl;
    // Usar el nombre del archivo original con sufijo _epicenter
    link.download = `${result.originalFileName}_epicenter.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result]);

  return {
    isProcessing,
    progress,
    error,
    result,
    originalSpectrum,
    processedSpectrum,
    processAudio,
    clearResult,
    downloadProcessed,
  };
}

export default useAudioProcessor;
