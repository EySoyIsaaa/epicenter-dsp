import { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  originalUrl?: string;
  processedUrl?: string;
  onTimeUpdate?: (time: number) => void;
}

export function AudioPlayer({
  originalUrl,
  processedUrl,
  onTimeUpdate,
}: AudioPlayerProps) {
  const originalRef = useRef<HTMLAudioElement>(null);
  const processedRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'original' | 'processed'>('original');

  const activeAudio = activeTrack === 'original' ? originalRef.current : processedRef.current;
  const inactiveAudio = activeTrack === 'original' ? processedRef.current : originalRef.current;

  // Sync playback between tracks
  const syncPlayback = useCallback(() => {
    if (originalRef.current && processedRef.current) {
      const time = activeAudio?.currentTime || 0;
      if (inactiveAudio) {
        inactiveAudio.currentTime = time;
      }
    }
  }, [activeAudio, inactiveAudio]);

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!activeAudio) return;

    if (isPlaying) {
      activeAudio.pause();
      inactiveAudio?.pause();
    } else {
      syncPlayback();
      activeAudio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, activeAudio, inactiveAudio, syncPlayback]);

  // Handle track switch (A/B comparison)
  const switchTrack = useCallback((track: 'original' | 'processed') => {
    if (track === activeTrack) return;
    
    const wasPlaying = isPlaying;
    const currentPos = activeAudio?.currentTime || 0;

    // Pause current
    activeAudio?.pause();

    // Switch
    setActiveTrack(track);

    // Sync and resume if was playing
    setTimeout(() => {
      const newActive = track === 'original' ? originalRef.current : processedRef.current;
      if (newActive) {
        newActive.currentTime = currentPos;
        newActive.volume = isMuted ? 0 : volume;
        if (wasPlaying) {
          newActive.play();
        }
      }
    }, 0);
  }, [activeTrack, isPlaying, activeAudio, volume, isMuted]);

  // Handle seek
  const handleSeek = useCallback((value: number[]) => {
    const time = value[0];
    if (originalRef.current) originalRef.current.currentTime = time;
    if (processedRef.current) processedRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Handle restart
  const handleRestart = useCallback(() => {
    handleSeek([0]);
  }, [handleSeek]);

  // Handle volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    setIsMuted(vol === 0);
    if (originalRef.current) originalRef.current.volume = vol;
    if (processedRef.current) processedRef.current.volume = vol;
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const vol = newMuted ? 0 : volume;
    if (originalRef.current) originalRef.current.volume = vol;
    if (processedRef.current) processedRef.current.volume = vol;
  }, [isMuted, volume]);

  // Update time display
  useEffect(() => {
    const audio = activeAudio;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeAudio, onTimeUpdate]);

  // Set initial volume
  useEffect(() => {
    if (originalRef.current) originalRef.current.volume = volume;
    if (processedRef.current) processedRef.current.volume = volume;
  }, [volume]);

  // Format time
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasAudio = originalUrl || processedUrl;

  return (
    <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
      {/* Hidden audio elements */}
      <audio ref={originalRef} src={originalUrl} preload="metadata" />
      <audio ref={processedRef} src={processedUrl} preload="metadata" />

      {/* A/B Switch */}
      <div className="flex justify-center gap-2 mb-4">
        <Button
          variant={activeTrack === 'original' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchTrack('original')}
          disabled={!originalUrl}
          className={activeTrack === 'original' 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'border-zinc-700 hover:bg-zinc-800'}
        >
          <span className="font-bold mr-1">A</span> Original
        </Button>
        <Button
          variant={activeTrack === 'processed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchTrack('processed')}
          disabled={!processedUrl}
          className={activeTrack === 'processed' 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'border-zinc-700 hover:bg-zinc-800'}
        >
          <span className="font-bold mr-1">B</span> Procesado
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          disabled={!hasAudio}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestart}
            disabled={!hasAudio}
            className="text-zinc-400 hover:text-white"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={togglePlay}
            disabled={!hasAudio}
            className="bg-red-600 hover:bg-red-700 w-10 h-10"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>

      {/* Current track indicator */}
      {hasAudio && (
        <div className="mt-3 text-center">
          <span className="text-xs text-zinc-500">
            Reproduciendo: {' '}
            <span className={activeTrack === 'original' ? 'text-blue-400' : 'text-red-400'}>
              {activeTrack === 'original' ? 'Original' : 'Procesado'}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

export default AudioPlayer;
