import { app } from '../server/server.js';

export default function handler(req, res) {
  let url = req.url || '/';

  // Normalize URL if Vercel routes catch-all dynamic parameter
  if (url.includes('[...all]') || url.includes('[...slug]')) {
    const slug = req.query?.all || req.query?.slug;
    const path = Array.isArray(slug) ? slug.join('/') : (slug || '');
    url = `/api/${path}`;
  } else if (!url.startsWith('/api')) {
    url = `/api${url.startsWith('/') ? url : `/${url}`}`;
  }

  req.url = url;

  // Handle pre-parsed body from Vercel Serverless runtime
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // ignore
    }
  }
  if (req.body && typeof req.body === 'object') {
    req._body = true;
  }

  return app(req, res);
}
