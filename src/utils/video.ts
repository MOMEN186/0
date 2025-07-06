// utils/video.ts

/**
 * Convert an external URL to use our proxy
 */
export function getProxyUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const host = urlObj.host;
    const path = urlObj.pathname + urlObj.search;
    return `/api/proxy/${host}${path}`;
  } catch {
    console.error('Invalid URL:', url);
    return url;
  }
}

/**
 * Get fallback server from servers data
 */
export function getFallbackServer(serversData: any): { serverName: string; key: string } {
  if (!serversData || !Array.isArray(serversData.sub)) {
    return { serverName: "", key: "" };
  }
  
  const defaultServer = serversData.sub[0];
  console.log(defaultServer);

  if (!defaultServer) {
    return { serverName: "", key: "" };
  }

  return {
    serverName: defaultServer.serverName || "",
    key: defaultServer.serverId?.toString() || "",
  };
}

/**
 * Get server by name from servers data
 */
export function getServerByName(serversData: any, serverName: string, type: 'sub' | 'dub' = 'sub'): any {
  if (!serversData || !Array.isArray(serversData[type])) {
    return null;
  }
  
  return serversData[type].find((server: any) => server.serverName === serverName);
}

/**
 * Get all available servers
 */
export function getAvailableServers(serversData: any): { sub: any[], dub: any[] } {
  if (!serversData) {
    return { sub: [], dub: [] };
  }
  
  return {
    sub: Array.isArray(serversData.sub) ? serversData.sub : [],
    dub: Array.isArray(serversData.dub) ? serversData.dub : [],
  };
}

/**
 * Check if a URL is external (needs proxy)
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const currentHost = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
    return urlObj.host !== currentHost;
  } catch {
    return false;
  }
}

/**
 * Validate video URL format
 */
export function isValidVideoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.m3u8', '.mp4', '.webm', '.mkv', '.avi'];
    const hasValidExtension = validExtensions.some(ext => 
      urlObj.pathname.toLowerCase().includes(ext)
    );
    return hasValidExtension || urlObj.pathname.includes('master') || urlObj.pathname.includes('playlist');
  } catch {
    return false;
  }
}

/**
 * Get video quality from HLS manifest URL
 */
export function getVideoQuality(url: string): string {
  const qualityPatterns = [
    { pattern: /1080p?/i, quality: '1080p' },
    { pattern: /720p?/i, quality: '720p' },
    { pattern: /480p?/i, quality: '480p' },
    { pattern: /360p?/i, quality: '360p' },
    { pattern: /240p?/i, quality: '240p' },
    { pattern: /hd/i, quality: 'HD' },
    { pattern: /sd/i, quality: 'SD' },
  ];

  for (const { pattern, quality } of qualityPatterns) {
    if (pattern.test(url)) {
      return quality;
    }
  }

  return 'Auto';
}

/**
 * Handle video loading errors with retry logic
 */
export class VideoErrorHandler {
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async handleError(error: Error, retryCallback: () => Promise<void>): Promise<void> {
    console.error('Video error:', error);
    
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying... (${this.retryCount}/${this.maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      await retryCallback();
    } else {
      console.error('Max retries reached. Video playback failed.');
      throw new Error('Video playback failed after multiple retries');
    }
  }

  reset(): void {
    this.retryCount = 0;
  }
}

/**
 * Create optimized HLS configuration
 */
export function createHlsConfig(options: Partial<any> = {}): any {
  return {
    debug: false,
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 90,
    maxBufferLength: 600,
    maxMaxBufferLength: 1200,
    maxBufferSize: 60 * 1000 * 1000,
    maxBufferHole: 0.5,
    highBufferWatchdogPeriod: 2,
    nudgeOffset: 0.1,
    nudgeMaxRetry: 3,
    maxFragLookUpTolerance: 0.25,
    liveSyncDurationCount: 3,
    liveMaxLatencyDurationCount: 10,
    liveDurationInfinity: false,
    liveBackBufferLength: 0,
    maxLiveSyncPlaybackRate: 1.5,
    maxStarvationDelay: 4,
    maxLoadingDelay: 4,
    minAutoBitrate: 0,
    emeEnabled: false,
    fragLoadPolicy: {
      default: {
        maxTimeToFirstByteMs: 10000,
        maxLoadTimeMs: 120000,
        timeoutRetry: {
          maxNumRetry: 4,
          retryDelayMs: 0,
          maxRetryDelayMs: 0,
        },
        errorRetry: {
          maxNumRetry: 6,
          retryDelayMs: 1000,
          maxRetryDelayMs: 8000,
        },
      },
    },
    playlistLoadPolicy: {
      default: {
        maxTimeToFirstByteMs: 10000,
        maxLoadTimeMs: 20000,
        timeoutRetry: {
          maxNumRetry: 2,
          retryDelayMs: 0,
          maxRetryDelayMs: 0,
        },
        errorRetry: {
          maxNumRetry: 2,
          retryDelayMs: 1000,
          maxRetryDelayMs: 8000,
        },
      },
    },
    manifestLoadPolicy: {
      default: {
        maxTimeToFirstByteMs: 10000,
        maxLoadTimeMs: 20000,
        timeoutRetry: {
          maxNumRetry: 2,
          retryDelayMs: 0,
          maxRetryDelayMs: 0,
        },
        errorRetry: {
          maxNumRetry: 2,
          retryDelayMs: 1000,
          maxRetryDelayMs: 8000,
        },
      },
    },
    ...options,
  };
}