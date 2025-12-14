import { useState, useCallback } from 'react';
import { Download, Zap, Volume2, History, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Knob } from '@/components/Knob';
import { FileUploader } from '@/components/FileUploader';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SpectrumVisualizer } from '@/components/SpectrumVisualizer';
import { PresetSelector, PRESETS, type Preset } from '@/components/PresetSelector';
import { YouTubeSearch } from '@/components/YouTubeSearch';
import { AdSense } from '@/components/AdSense';
import { useAudioProcessor } from '@/hooks/useAudioProcessor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

interface AudioFileInfo {
  file: File;
  name: string;
  format: string;
  size: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<AudioFileInfo | null>(null);
  const [sweepFreq, setSweepFreq] = useState(45);
  const [width, setWidth] = useState(50);
  const [intensity, setIntensity] = useState(50);
  const [balance, setBalance] = useState(50); // 0=voz, 100=bajo
  const [activePreset, setActivePreset] = useState('custom');

  const {
    isProcessing,
    progress,
    error,
    result,
    originalSpectrum,
    processedSpectrum,
    processAudio,
    clearResult,
    downloadProcessed,
  } = useAudioProcessor();

  const handleFileSelect = useCallback((fileInfo: AudioFileInfo) => {
    setSelectedFile(fileInfo);
    clearResult();
  }, [clearResult]);

  const handleFileClear = useCallback(() => {
    setSelectedFile(null);
    clearResult();
  }, [clearResult]);

  const handleYouTubeDownload = useCallback((file: File) => {
    // Crear AudioFileInfo desde el archivo descargado
    const fileInfo: AudioFileInfo = {
      file,
      name: file.name,
      format: 'mp3',
      size: file.size,
    };
    setSelectedFile(fileInfo);
    clearResult();
  }, [clearResult]);

  const handlePresetSelect = useCallback((preset: Preset) => {
    setSweepFreq(preset.sweepFreq);
    setWidth(preset.width);
    setIntensity(preset.intensity);
    setActivePreset(preset.id);
  }, []);

  const handleKnobChange = useCallback((setter: (v: number) => void) => {
    return (value: number) => {
      setter(value);
      setActivePreset('custom');
    };
  }, []);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;
    
    await processAudio(selectedFile, {
      sweepFreq,
      width,
      intensity,
      balance,
    });
  }, [selectedFile, sweepFreq, width, intensity, balance, processAudio]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center glow-red">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">EPICENTER DSP</h1>
                <p className="text-xs text-muted-foreground">Procesador de Restauración de Bajos</p>
                <p className="text-xs text-muted-foreground/70 italic">Desarrollado por Abraham Isaias Garcia Barragan</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/history">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <History className="w-5 h-5" />
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Info className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Acerca de Epicenter DSP</DialogTitle>
                    <DialogDescription>
                      Procesador de audio basado en la patente US4698842
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Epicenter DSP</strong> es una recreación digital del 
                      AudioControl Epicenter, un procesador de restauración de bajos utilizado en sistemas 
                      de car audio profesional.
                    </p>
                    <p>
                      El algoritmo analiza los armónicos superiores presentes en la señal y sintetiza 
                      las frecuencias fundamentales que faltan o fueron atenuadas, generando sub-bajos 
                      masivos con boosts de hasta 50x en frecuencias específicas.
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <div className="text-2xl font-bold text-red-500">27-63</div>
                        <div className="text-xs">Hz Sweep</div>
                      </div>
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <div className="text-2xl font-bold text-red-500">50x</div>
                        <div className="text-xs">Max Boost</div>
                      </div>
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <div className="text-2xl font-bold text-red-500">MP3</div>
                        <div className="text-xs">Output</div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Main Panel */}
          <div className="space-y-6">
            {/* Anuncio Superior */}
            <AdSense 
              adSlot="1111111111" 
              adFormat="horizontal"
              className="mb-6"
            />

            {/* YouTube Search */}
            <YouTubeSearch
              onAudioDownloaded={handleYouTubeDownload}
              disabled={isProcessing}
            />

            {/* File Upload */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-6">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  O Sube un Archivo de Audio
                </h2>
                <FileUploader
                  onFileSelect={handleFileSelect}
                  onClear={handleFileClear}
                  selectedFile={selectedFile}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>

            {/* Controls Panel */}
            <Card className="border-border/50 bg-card/80 backdrop-blur overflow-hidden">
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-1">
                <div className="bg-gradient-to-b from-zinc-900 to-black p-6 rounded-sm">
                  {/* Presets */}
                  <div className="mb-8">
                    <PresetSelector
                      activePreset={activePreset}
                      onSelectPreset={handlePresetSelect}
                      disabled={isProcessing}
                    />
                  </div>

                  {/* Knobs */}
                  <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    <Knob
                      value={sweepFreq}
                      min={27}
                      max={63}
                      onChange={handleKnobChange(setSweepFreq)}
                      label="SWEEP"
                      unit="Hz"
                      color="#ef4444"
                      disabled={isProcessing}
                    />
                    <Knob
                      value={width}
                      min={0}
                      max={100}
                      onChange={handleKnobChange(setWidth)}
                      label="WIDTH"
                      unit="%"
                      color="#f97316"
                      disabled={isProcessing}
                    />
                    <Knob
                      value={intensity}
                      min={0}
                      max={100}
                      onChange={handleKnobChange(setIntensity)}
                      label="INTENSITY"
                      unit="%"
                      color="#eab308"
                      disabled={isProcessing}
                    />
                    <Knob
                      value={balance}
                      min={0}
                      max={100}
                      onChange={handleKnobChange(setBalance)}
                      label="BALANCE"
                      unit="%"
                      color="#06b6d4"
                      disabled={isProcessing}
                    />
                  </div>

                  {/* LED Indicators */}
                  <div className="flex justify-center gap-4 mt-8">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedFile ? 'led-on' : 'led-off'}`} />
                      <span className="text-xs text-zinc-500">INPUT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isProcessing ? 'led-on animate-pulse' : 'led-off'}`} />
                      <span className="text-xs text-zinc-500">PROCESS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${result ? 'led-on' : 'led-off'}`} />
                      <span className="text-xs text-zinc-500">OUTPUT</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Spectrum Visualization */}
            {(originalSpectrum || processedSpectrum) && (
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    Análisis Espectral
                  </h2>
                  <SpectrumVisualizer
                    originalData={originalSpectrum || undefined}
                    processedData={processedSpectrum || undefined}
                    width={600}
                    height={200}
                  />
                </CardContent>
              </Card>
            )}

            {/* Audio Player */}
            {result && (
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    Comparación A/B
                  </h2>
                  <AudioPlayer
                    originalUrl={result.originalUrl}
                    processedUrl={result.processedUrl}
                  />
                </CardContent>
              </Card>
            )}

            {/* Anuncio Inferior */}
            <AdSense 
              adSlot="2222222222" 
              adFormat="horizontal"
              className="mt-6"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Process Button & Progress */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-6">
                <Button
                  onClick={handleProcess}
                  disabled={!selectedFile || isProcessing}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 glow-red"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      PROCESAR
                    </span>
                  )}
                </Button>

                {isProcessing && (
                  <div className="mt-4 space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      {progress}% completado
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {result && !isProcessing && (
                  <Button
                    onClick={downloadProcessed}
                    variant="outline"
                    className="w-full mt-4 border-green-600/50 text-green-500 hover:bg-green-600/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar MP3
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Current Settings */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Configuración Actual
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Frecuencia Central</span>
                    <span className="font-mono text-red-500">{sweepFreq} Hz</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Ancho de Banda</span>
                    <span className="font-mono text-orange-500">{width}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Intensidad</span>
                    <span className="font-mono text-yellow-500">{intensity}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Preset</span>
                    <span className="font-medium text-foreground capitalize">
                      {PRESETS.find(p => p.id === activePreset)?.name || 'Custom'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Consejos
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Regional/Banda:</strong> Use SWEEP 40-45 Hz 
                    con INTENSITY alta (75-85%) para máximo impacto.
                  </p>
                  <p>
                    <strong className="text-foreground">Rock:</strong> SWEEP 45-50 Hz con 
                    INTENSITY moderada (60-75%) evita saturación.
                  </p>
                  <p>
                    <strong className="text-foreground">Evite en Hip-Hop/EDM:</strong> Estos géneros 
                    ya tienen sub-bajos profundos, el efecto puede saturar.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Anuncio Sidebar */}
            <AdSense 
              adSlot="3333333333" 
              adFormat="vertical"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="text-center sm:text-left">
              <p>Epicenter DSP - Basado en la patente US4698842 de AudioControl</p>
              <p className="text-xs mt-1">Proyecto elaborado por Abraham Isaias Garcia Barragan</p>
            </div>
            <p>Procesamiento de audio en el navegador</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
