"use client";

import React, { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import artplayerPluginHlsControl from "artplayer-plugin-hls-control";
import artplayerPluginAmbilight from "artplayer-plugin-ambilight";

import type { Episodes } from "@/types/anime";
import { env } from "next-runtime-env";

interface ArbPlayerProps {
  src: string;
  posterUrl?: string;
  episodeInfo: Episodes;
  serversData: any;
  referer: string;
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
  referer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Artplayer | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    // Cleanup previous instances
    playerRef.current?.destroy();
    hlsRef.current?.destroy();
    if (containerRef.current) containerRef.current.innerHTML = "";

    if (!src || !containerRef.current) return;

    // Build proxied URL
    const raw = env("NEXT_PUBLIC_PROXY_URL") || "";
const baseURI = raw.replace(/\/+$/, "").replace(/\/m3u8$/, ""); // ensure no trailing slash or double /m3u8
const proxiedSrc = `${baseURI}/m3u8?url=${encodeURIComponent(src)}&referer=${encodeURIComponent(referer)}`;

    // Initialize Artplayer without HLS-control plugin yet
    const art = new Artplayer({
      container: containerRef.current,
      url: proxiedSrc,
      poster: posterUrl,
      autoplay: false,
      plugins: [
        artplayerPluginAmbilight({
          blur: "10px",
          opacity: 0.5,
          frequency: 100,
          zIndex: 1,
          duration: 1000,
        }),
      ],
    });
    playerRef.current = art;

    if (Hls.isSupported()) {
      // Setup Hls.js manually
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(proxiedSrc);
      hls.attachMedia(art.video as HTMLVideoElement);

      // Expose Hls.js on the Artplayer instance
      (art as any).hls = hls;
      // Now install HLS-control plugin via `use` (not installPlugin)
      // Install HLS-control plugin by invoking it with the Artplayer instance
      const hlsControl = artplayerPluginHlsControl({});
      hlsControl(art);

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error("HLS.js error", data);
      });
    } else {
      // Fallback for native HLS support
      art.video.src = proxiedSrc;
    }

    return () => {
      art.destroy();
      hlsRef.current?.destroy();
    };
  }, [src, posterUrl, referer]);

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
