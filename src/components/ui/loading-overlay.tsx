import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const loadingMessages = [
  'Suche nach Events in Nürnberg...',
  'Durchforste Veranstaltungskalender...',
  'Sammle Event-Details...',
  'Prüfe Verfügbarkeit...',
  'Organisiere Ergebnisse...'
];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, children }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setIsTextVisible(false);
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        setIsTextVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background blur only behind container */}
          <div className="absolute inset-0 bg-black/5" />
          
          {/* Main Liquid Glass Container - Fixed Width */}
          <div className="relative w-96">
            {/* Background Liquid Glass Panel with local blur */}
            <div className="absolute -inset-8 rounded-[32px] bg-white/25 backdrop-blur-2xl border border-white/40 shadow-lg" 
                 style={{
                   backdropFilter: 'blur(20px) saturate(180%)',
                   WebkitBackdropFilter: 'blur(20px) saturate(180%)'
                 }} />
            
            {/* Content Container */}
            <div className="relative flex flex-col items-center space-y-8 p-8">
              
              {/* Main Icon Container */}
              <div className="relative w-28 h-28">
                {/* Outer Liquid Glass Ring */}
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/30 via-white/10 to-white/30 backdrop-blur-xl border border-white/40 shadow-md animate-liquid-ring-subtle" />
                
                {/* Inner Glow Effect */}
                <div className="absolute inset-2 rounded-[16px] bg-gradient-to-br from-primary/15 via-transparent to-primary/10 animate-inner-glow-subtle" />
                
                {/* Calendar Icon Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <Calendar className="w-14 h-14 text-gray-700 drop-shadow-sm animate-icon-float-subtle" />
                    {/* Icon Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 rounded-lg animate-icon-reflection-subtle" />
                  </div>
                </div>

                {/* Floating Accent Dots */}
                <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-primary/30 backdrop-blur-md animate-accent-dot-subtle-1" />
                <div className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-gray-400/40 backdrop-blur-md animate-accent-dot-subtle-2" />
                <div className="absolute top-1/2 -left-4 w-2.5 h-2.5 rounded-full bg-primary/25 backdrop-blur-md animate-accent-dot-subtle-3" />
              </div>

              {/* Text Container - Fixed Width */}
              <div className="relative w-80">
                {/* Text Background Liquid Glass */}
                <div className="absolute -inset-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/25" />
                
                <div className="relative text-center space-y-4 px-4">
                  <div className="h-6 flex items-center justify-center">
                    <p className={cn(
                      "text-lg font-medium text-gray-800 drop-shadow-sm transition-opacity duration-300",
                      isTextVisible ? "opacity-100" : "opacity-0"
                    )}>
                      {loadingMessages[currentMessageIndex]}
                    </p>
                  </div>
                  
                  {/* Loading Dots Container */}
                  <div className="flex space-x-3 justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-500/60 backdrop-blur-sm shadow-sm animate-liquid-dot-1" />
                    <div className="w-2 h-2 rounded-full bg-gray-500/60 backdrop-blur-sm shadow-sm animate-liquid-dot-2" />
                    <div className="w-2 h-2 rounded-full bg-gray-500/60 backdrop-blur-sm shadow-sm animate-liquid-dot-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={cn(isLoading && 'pointer-events-none')}>
        {children}
      </div>
    </div>
  );
}; 