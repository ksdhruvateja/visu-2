import { Request, Response, NextFunction } from 'express';
import httpProxy from 'http-proxy';

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Handle proxy errors
proxy.on('error', (err, req, res: Response) => {
  console.error('Proxy error:', err);
  res.status(500).json({ error: 'Proxy error', message: err.message });
});

// Middleware to proxy Vite development server requests
export const proxyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip API requests
  if (req.path.startsWith('/api')) {
    return next();
  }

  // For all other requests, proxy to Vite dev server
  proxy.web(req, res, { target: 'http://localhost:5173' });
};