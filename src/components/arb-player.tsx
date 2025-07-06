"use client";

import React, { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import artplayerPluginHlsControl from "artplayer-plugin-hls-control";
import artplayerPluginAmbilight from "artplayer-plugin-ambilight";

import type { Episodes } from "@/types/anime";
interface ArbPlayerProps {
  /** URL of the video stream (e.g., an HLS manifest) */
  src: string;
  /** URL of the poster image to show before playback */
  posterUrl?: string;
  episodeInfo: Episodes;
  serversData: Record<string, any>;
  animeInfo: { id: string; title: string; image: string };
  onServerChange: (serverName: string, key: string) => void;
  onAutoSkipChange: (value: boolean) => Promise<void>;
  autoSkip: boolean;
  className?: string;
}

const ArbPlayer: React.FC<ArbPlayerProps> = ({
  src,
  posterUrl,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Artplayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  console.log("ArbPlayer - props:", { src, posterUrl, className });

  useEffect(() => {
    console.log("ArbPlayer - useEffect triggered with src:", src);
    if (!containerRef.current || !src) {
      console.log("ArbPlayer - early return:", { hasContainer: !!containerRef.current, hasSrc: !!src });
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log("ArbPlayer - cleaning up existing instances");
    // Cleanup existing instances
    if (player) {
      player.destroy();
      setPlayer(null);
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Build options for Artplayer
    const options = {
      container: containerRef.current,
      url: src,
      poster: posterUrl,
      autoplay: false,
      flip: false,
      loop: false,
      plugins: [
        artplayerPluginHlsControl({}),
        artplayerPluginAmbilight({
          blur: "10px",
          opacity: 0.5,
          frequency: 100,
          zIndex: 1,
          duration: 1000,
        }),
      ],
    };

    console.log("ArbPlayer - creating ArtPlayer with options:", options);

    try {
      const art = new Artplayer(options);
      console.log("ArbPlayer - ArtPlayer created successfully");
      setPlayer(art);

      if (Hls.isSupported()) {
        console.log("ArbPlayer - HLS is supported, creating HLS instance");
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        
        console.log("ArbPlayer - loading HLS source:", src);
        hls.loadSource(src);
        hls.attachMedia(art.video as HTMLVideoElement);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("ArbPlayer - HLS manifest parsed successfully");
          setIsLoading(false);
          art.play();
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("ArbPlayer - HLS error:", data);
          setError("Failed to load video stream");
          setIsLoading(false);
        });
      } else {
        console.log("ArbPlayer - HLS not supported, using fallback");
        // Fallback for browsers that don't support HLS
        art.on("video:loadedmetadata", () => {
          console.log("ArbPlayer - Video metadata loaded");
          setIsLoading(false);
        });
        
        art.on("video:error", () => {
          console.error("ArbPlayer - Video error");
          setError("Failed to load video");
          setIsLoading(false);
        });

        art.on("video:canplay", () => {
          console.log("ArbPlayer - Video can play");
        });
        
        art.play();
      }

      return () => {
        console.log("ArbPlayer - cleanup function called");
        art.destroy();
        hlsRef.current?.destroy();
      };
    } catch (err) {
      console.error("ArbPlayer - Error creating ArtPlayer:", err);
      setError("Failed to initialize video player");
      setIsLoading(false);
    }
  }, [src, posterUrl]);

  console.log("ArbPlayer - render state:", { isLoading, error, hasSrc: !!src });

  if (!src) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-800 text-white`}>
        <div>No video source available</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-800 text-white`}>
        <div className="text-center">
          <div className="text-red-400 mb-2">Error loading video</div>
          <div className="text-sm text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-800 text-white`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <div>Loading video...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default ArbPlayer;