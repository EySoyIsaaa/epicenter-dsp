import { ArrowUpCircle, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from './ui/button';
import { useState } from 'react';

export function PWAInstallBanner() {
  const { shouldShowInstallPrompt } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(true);

  if (!shouldShowInstallPrompt || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-red-600 text-white p-3 shadow-2xl flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <ArrowUpCircle className="w-6 h-6 flex-shrink-0" />
        <p className="text-sm font-medium">
          **Experiencia de App:** Toca el ícono de **Compartir** <span className="font-bold">(&uarr; en un cuadrado)</span> y selecciona **"Añadir a inicio"**.
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsVisible(false)}
        className="text-white hover:bg-red-700"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
}
