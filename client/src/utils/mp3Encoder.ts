/**
 * MP3 Encoder usando lamejs
 * Convierte audio Float32Array a MP3
 */

import lamejs from '@breezystack/lamejs';

export function createMp3Blob(audioData: Float32Array[], sampleRate: number): Blob {
  const numChannels = audioData.length;
  const length = audioData[0].length;
  
  // Configuración del encoder MP3
  const kbps = 320; // Calidad alta
  const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, kbps);
  
  // Convertir Float32Array a Int16Array
  const samples = new Int16Array(length * numChannels);
  
  if (numChannels === 1) {
    // Mono
    for (let i = 0; i < length; i++) {
      samples[i] = Math.max(-32768, Math.min(32767, audioData[0][i] * 32767));
    }
  } else {
    // Estéreo - intercalar canales
    for (let i = 0; i < length; i++) {
      samples[i * 2] = Math.max(-32768, Math.min(32767, audioData[0][i] * 32767));
      samples[i * 2 + 1] = Math.max(-32768, Math.min(32767, audioData[1][i] * 32767));
    }
  }
  
  // Codificar en bloques
  const mp3Data: Uint8Array[] = [];
  const blockSize = 1152; // Tamaño de bloque estándar para MP3
  
  for (let i = 0; i < samples.length; i += blockSize * numChannels) {
    const leftChannel = new Int16Array(blockSize);
    const rightChannel = numChannels === 2 ? new Int16Array(blockSize) : null;
    
    for (let j = 0; j < blockSize; j++) {
      const idx = i + j * numChannels;
      if (idx < samples.length) {
        leftChannel[j] = samples[idx];
        if (rightChannel && idx + 1 < samples.length) {
          rightChannel[j] = samples[idx + 1];
        }
      }
    }
    
    const mp3buf = rightChannel 
      ? mp3encoder.encodeBuffer(leftChannel, rightChannel)
      : mp3encoder.encodeBuffer(leftChannel);
      
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }
  
  // Flush final
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }
  
  // Combinar todos los bloques
  return new Blob(mp3Data, { type: 'audio/mp3' });
}
