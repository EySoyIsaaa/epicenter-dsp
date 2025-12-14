import { useCallback, useState } from 'react';
import { Upload, FileAudio, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioFileInfo {
  file: File;
  name: string;
  format: string;
  size: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
}

interface FileUploaderProps {
  onFileSelect: (fileInfo: AudioFileInfo) => void;
  onClear: () => void;
  selectedFile?: AudioFileInfo | null;
  disabled?: boolean;
}

const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/x-flac'];
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.ogg'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function FileUploader({
  onFileSelect,
  onClear,
  selectedFile,
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_FORMATS.includes(file.type) && 
        !SUPPORTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
      return 'Formato no soportado. Use MP3, WAV, FLAC u OGG.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo es demasiado grande. Máximo 100MB.';
    }
    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    // Get audio metadata using Web Audio API
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    
    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const fileInfo: AudioFileInfo = {
        file,
        name: file.name,
        format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        size: file.size,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
      };

      onFileSelect(fileInfo);
    } catch (err) {
      setError('No se pudo leer el archivo de audio. Verifique que no esté corrupto.');
    } finally {
      audioContext.close();
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [disabled, processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset input
    e.target.value = '';
  }, [processFile]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedFile) {
    return (
      <div className="relative bg-zinc-900/80 rounded-xl p-4 border border-zinc-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          disabled={disabled}
          className="absolute top-2 right-2 text-zinc-500 hover:text-white hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-600/20 rounded-lg">
            <FileAudio className="w-8 h-8 text-red-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-white truncate pr-8">
              {selectedFile.name}
            </h4>
            
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-zinc-500 block text-xs">Formato</span>
                <span className="text-zinc-300 font-mono">{selectedFile.format}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-xs">Tamaño</span>
                <span className="text-zinc-300 font-mono">{formatFileSize(selectedFile.size)}</span>
              </div>
              {selectedFile.duration && (
                <div>
                  <span className="text-zinc-500 block text-xs">Duración</span>
                  <span className="text-zinc-300 font-mono">{formatDuration(selectedFile.duration)}</span>
                </div>
              )}
              {selectedFile.sampleRate && (
                <div>
                  <span className="text-zinc-500 block text-xs">Sample Rate</span>
                  <span className="text-zinc-300 font-mono">{selectedFile.sampleRate} Hz</span>
                </div>
              )}
              {selectedFile.channels && (
                <div>
                  <span className="text-zinc-500 block text-xs">Canales</span>
                  <span className="text-zinc-300 font-mono">
                    {selectedFile.channels === 1 ? 'Mono' : selectedFile.channels === 2 ? 'Estéreo' : `${selectedFile.channels}ch`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragging 
            ? 'border-red-500 bg-red-500/10' 
            : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept=".mp3,.wav,.flac,.ogg,audio/*"
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-red-500/20' : 'bg-zinc-800'}`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-red-500' : 'text-zinc-500'}`} />
          </div>
          
          <div>
            <p className="text-zinc-300 font-medium">
              {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo de audio'}
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              o haz clic para seleccionar
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {SUPPORTED_EXTENSIONS.map(ext => (
              <span 
                key={ext}
                className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 font-mono"
              >
                {ext}
              </span>
            ))}
          </div>

          <p className="text-zinc-600 text-xs mt-2">
            Máximo 100MB
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export default FileUploader;
