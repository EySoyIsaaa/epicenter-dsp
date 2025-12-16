import { useState } from 'react';
import { Search, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface YouTubeSearchProps {
  onAudioDownloaded: (file: File) => void;
  disabled?: boolean;
}

export function YouTubeSearch({ onAudioDownloaded, disabled }: YouTubeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Por favor ingresa el nombre de una canción');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Llamar al endpoint del servidor para descargar desde YouTube
      const response = await fetch('/api/youtube/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Error al descargar la canción');
      }

      const blob = await response.blob();
      const fileName = response.headers.get('X-File-Name') || 'downloaded_audio.mp3';
      
      // Crear un File object desde el blob
      const file = new File([blob], fileName, { type: 'audio/mpeg' });
      
      // Pasar el archivo al componente padre
      onAudioDownloaded(file);
      
      setSearchQuery('');
    } catch (err) {
      console.error('Error downloading from YouTube:', err);
      setError(err instanceof Error ? err.message : 'Error al descargar la canción');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardContent className="p-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Buscar canción
        </h2>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Escribe el nombre de la canción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled || isSearching}
              className="bg-background/50"
            />
          </div>
          
          <Button
            onClick={handleSearch}
            disabled={disabled || isSearching || !searchQuery.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Buscar y Descargar
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="mt-3 text-xs text-muted-foreground">
          La canción se descargará automáticamente y se cargará en el procesador
        </div>
      </CardContent>
    </Card>
  );
}
