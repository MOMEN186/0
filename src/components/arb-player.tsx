"use client";

import React, { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import artplayerPluginHlsControl from "artplayer-plugin-hls-control";
import artplayerPluginAmbilight from "artplayer-plugin-ambilight";

// Define required types for props
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
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    console.log("src:", src);
    if (!containerRef.current) return;

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
      blur: "10px",  // Fixed to a string
      opacity: 0.5,
      frequency: 100,
      zIndex: 1,
      duration: 1000,
    }),
  ],
};

    const art = new Artplayer(options);
    setPlayer(art);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(art.video as HTMLVideoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        art.play();
      });
    } else {
      art.play();
    }

    return () => {
      art.destroy();
      hlsRef.current?.destroy();
    };
  }, [src, posterUrl]);

  if (!src) {
    return <div className={className}>Loading video…</div>;
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