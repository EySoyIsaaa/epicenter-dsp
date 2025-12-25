import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [isIPhone, setIsIPhone] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detección de iPhone (iOS)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // 2. Detección de modo Standalone (PWA instalada)
    // En iOS, el modo standalone se detecta por la propiedad 'standalone'
    const isPWA = (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator as any).standalone;

    setIsIPhone(isIOS);
    setIsStandalone(isPWA);
  }, []);

  // Devolver true si es iPhone Y NO está en modo standalone
  const shouldShowInstallPrompt = isIPhone && !isStandalone;

  return { shouldShowInstallPrompt };
};
