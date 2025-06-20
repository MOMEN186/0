"use client";
import React, { useEffect } from 'react';

interface AdProps {
  adSlot: string;
  adFormat: 'banner468x60' | 'banner160x300' | 'banner320x50' | 'banner300x250' | 'banner160x600' | 'banner728x90';
  className?: string;
  customAd?: boolean;
  style?: React.CSSProperties;
}

const adSizes = {
  'banner468x60': { width: '468px', height: '60px' },
  'banner160x300': { width: '160px', height: '300px' },
  'banner320x50': { width: '320px', height: '50px' },
  'banner300x250': { width: '300px', height: '250px' },
  'banner160x600': { width: '160px', height: '600px' },
  'banner728x90': { width: '728px', height: '90px' }
};

const CustomAd300x250 = () => {
  useEffect(() => {
    // Create and inject the first script
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.text = `
      atOptions = {
        'key' : '616ae1208795cc7f6c060dab3f90b39a',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    document.head.appendChild(script1);

    // Create and inject the second script
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = '//www.highperformanceformat.com/616ae1208795cc7f6c060dab3f90b39a/invoke.js';
    script2.async = true;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts when component unmounts
      document.head.removeChild(script1);
      if (script2.parentNode) {
        document.head.removeChild(script2);
      }
    };
  }, []);

  return <div className="w-[300px] h-[250px]" />;
};

const CustomAd728x90 = () => {
  useEffect(() => {
    // Create and inject the first script
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.text = `
      atOptions = {
        'key' : '1641fc47cafd19763637a9c60f944870',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    document.head.appendChild(script1);

    // Create and inject the second script
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = '//www.highperformanceformat.com/1641fc47cafd19763637a9c60f944870/invoke.js';
    script2.async = true;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts when component unmounts
      document.head.removeChild(script1);
      if (script2.parentNode) {
        document.head.removeChild(script2);
      }
    };
  }, []);

  return <div className="w-[728px] h-[90px]" />;
};

const CustomAd160x600 = () => {
  useEffect(() => {
    // Create and inject the first script
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.text = `
      atOptions = {
        'key' : '283cf37ade878146011a633c4d81001a',
        'format' : 'iframe',
        'height' : 600,
        'width' : 160,
        'params' : {}
      };
    `;
    document.head.appendChild(script1);

    // Create and inject the second script
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = '//www.highperformanceformat.com/283cf37ade878146011a633c4d81001a/invoke.js';
    script2.async = true;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts when component unmounts
      document.head.removeChild(script1);
      if (script2.parentNode) {
        document.head.removeChild(script2);
      }
    };
  }, []);

  return <div className="w-[160px] h-[600px]" />;
};

const CustomAd468x60 = () => {
  useEffect(() => {
    // Create and inject the config script
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.text = `
      atOptions = {
        'key' : '45ccaf578857be4a62681d11c3adf139',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    document.head.appendChild(script1);

    // Create and inject the invoke script
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = '//www.highperformanceformat.com/45ccaf578857be4a62681d11c3adf139/invoke.js';
    script2.async = true;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return <div className="w-[468px] h-[60px]" />;
};

const CustomAd320x50 = () => {
  useEffect(() => {
    // Create and inject the config script
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.text = `
      atOptions = {
        'key' : '9a99732d4d7b69c1c72b98ac19fa7bcb',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    document.head.appendChild(script1);

    // Create and inject the invoke script
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = '//www.highperformanceformat.com/9a99732d4d7b69c1c72b98ac19fa7bcb/invoke.js';
    script2.async = true;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return <div className="w-[320px] h-[50px]" />;
};

const CustomAd160x300 = () => {
  useEffect(() => {
    // Create and inject the config script
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.text = `
      atOptions = {
        'key' : '33212a8e4c356f3ca46bc93693f89465',
        'format' : 'iframe',
        'height' : 300,
        'width' : 160,
        'params' : {}
      };
    `;
    document.head.appendChild(script1);

    // Create and inject the invoke script
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = '//www.highperformanceformat.com/33212a8e4c356f3ca46bc93693f89465/invoke.js';
    script2.async = true;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return <div className="w-[160px] h-[300px]" />;
};

const Advertisement = ({ adFormat, className, customAd = true, style }: AdProps) => {
  const size = adSizes[adFormat];
  return (
    <div className={`w-full flex justify-center my-4 ${className || ''}`} style={style}>
      {customAd ? (
        adFormat === 'banner300x250' ? (
          <CustomAd300x250 />
        ) : adFormat === 'banner728x90' ? (
          <CustomAd728x90 />
        ) : adFormat === 'banner160x600' ? (
          <CustomAd160x600 />
        ) : adFormat === 'banner468x60' ? (
          <CustomAd468x60 />
        ) : adFormat === 'banner320x50' ? (
          <CustomAd320x50 />
        ) : adFormat === 'banner160x300' ? (
          <CustomAd160x300 />
        ) : (
          <div style={{
            width: size?.width || '0px',
            height: size?.height || '0px'
          }} />
        )
      ) : (
        <div style={{
          width: size?.width || '0px',
          height: size?.height || '0px'
        }} />
      )}
    </div>
  );
};

export default Advertisement;
