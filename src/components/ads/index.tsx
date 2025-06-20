'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AdProps {
  position: 'top' | 'bottom' | 'middle';
  className?: string;
}

const AD_CONFIG = {
  key: '616ae1208795cc7f6c060dab3f90b39a',
  format: 'iframe',
  height: 250,
  width: 300,
};

const Advertisement: React.FC<AdProps> = ({ position, className = '' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle ad loading
  useEffect(() => {
    if (!isClient || !adContainerRef.current) return;

    const adId = `ad-${position}-${Math.random().toString(36).substr(2, 9)}`;
    let cleanup: (() => void) | undefined;
    
    const setupAd = () => {
      try {
        // Add the ad container div
        const adDiv = document.createElement('div');
        adDiv.id = adId;
        adContainerRef.current?.appendChild(adDiv);

        // Initialize ad options
        (window as any).atOptions = {
          key: AD_CONFIG.key,
          format: AD_CONFIG.format,
          height: AD_CONFIG.height,
          width: AD_CONFIG.width,
          params: {}
        };

        // Load the ad script
        const script = document.createElement('script');
        script.src = `//www.highperformanceformat.com/${AD_CONFIG.key}/invoke.js`;
        script.async = true;
        
        script.onload = () => {
          setIsLoaded(true);
          console.log(`Ad script loaded successfully for position: ${position}`);
        };
        
        script.onerror = (e) => {
          setError('Failed to load advertisement');
          console.error(`Ad script failed to load for position: ${position}`, e);
        };

        // Add script to head
        document.head.appendChild(script);

        // Setup cleanup
        cleanup = () => {
          if (adContainerRef.current?.contains(adDiv)) {
            adContainerRef.current.removeChild(adDiv);
          }
          if (script.parentNode) {
            document.head.removeChild(script);
          }
          delete (window as any).atOptions;
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Error setting up advertisement:', err);
      }
    };

    setupAd();

    // Return cleanup function
    return () => {
      if (cleanup) cleanup();
    };
  }, [isClient, position]);

  // Add meta tag for ads verification
  useEffect(() => {
    if (!isClient) return;

    const metaTag = document.createElement('meta');
    metaTag.name = 'monetag';
    metaTag.content = '4f83da3f8397916d835354d52cd99c5a';
    document.head.appendChild(metaTag);

    return () => {
      if (document.head.contains(metaTag)) {
        document.head.removeChild(metaTag);
      }
    };
  }, [isClient]);

  return (
    <div 
      ref={adContainerRef}
      className={`ad-container ${className}`}
      data-position={position}
    >
      {error && (
        <div className="ad-error">
          <p>{error}</p>
        </div>
      )}
      {!isLoaded && !error && (
        <div className="ad-loading">
          <p>Loading advertisement...</p>
        </div>
      )}
    </div>
  );
};

export default Advertisement;
