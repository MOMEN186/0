import { createProxyMiddleware } from 'http-proxy-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

// Catch-all proxy handler for /api/proxy/{host}/{path}
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const pathSegments = (req.query.path as string[]) || [];
  if (pathSegments.length < 2) {
    return res.status(400).json({ error: 'Invalid proxy path' });
  }

  // First segment is the host, rest is the resource path
  const [host, ...resourcePath] = pathSegments;
  // Rewrite the url so http-proxy knows what to request
  req.url = '/' + resourcePath.join('/');

  // Create and apply the middleware
  const proxy = createProxyMiddleware({
    target: `https://${host}`,
    changeOrigin: true,
    secure: false,
    selfHandleResponse: false,
    pathRewrite: undefined, // already rewrote req.url manually
    onProxyReq: (proxyReq: any) => {
      // Standard headers emulating a browser video request
      proxyReq.setHeader('Referer', 'https://megacloud.blog');
      proxyReq.setHeader('Origin', 'https://megacloud.blog');
      proxyReq.setHeader('User-Agent', req.headers['user-agent']!);
      proxyReq.setHeader('Accept', 'application/vnd.apple.mpegurl');
      proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
      proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
      proxyReq.setHeader('Connection', 'keep-alive');
      proxyReq.setHeader('Sec-Fetch-Dest', 'video');
      proxyReq.setHeader('Sec-Fetch-Mode', 'cors');
      proxyReq.setHeader('Sec-Fetch-Site', 'cross-site');
      proxyReq.setHeader('Range', req.headers.range || 'bytes=0-');
    },
    onProxyRes: (proxyRes: any, _req: any, res: any) => {
      // Enable CORS and streaming headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range,Content-Type');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges');
      // Preserve upstream Accept-Ranges header
      const acceptRanges = proxyRes.headers['accept-ranges'];
      if (acceptRanges) {
        res.setHeader('Accept-Ranges', acceptRanges as string);
      }
    },
  } as any);

  return proxy(req as any, res as any);
}
