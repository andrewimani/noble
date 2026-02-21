import { NextRequest, NextResponse } from 'next/server'

type Entry = { count: number; resetAt: number };

const WINDOW_MS = 60 * 1000; // 1 minute
const LIMIT = 60; // requests per window per IP

// Simple in-memory store persisted on globalThis across reloads
const store = (globalThis as any).__arcanon_rate_limiter ||= new Map<string, Entry>();

function getIp(req: NextRequest) {
  // prefer x-forwarded-for header when present
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  try {
    return req.ip || req.headers.get('x-real-ip') || 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (!pathname.startsWith('/api/public')) return NextResponse.next();

  const ip = getIp(req) || 'unknown';
  const now = Date.now();
  const ent = store.get(ip) as Entry | undefined;
  if (!ent || now > ent.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (ent.count >= LIMIT) {
    const retryAfter = Math.ceil((ent.resetAt - now) / 1000);
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
    });
  }

  ent.count += 1;
  store.set(ip, ent);
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/public/:path*'],
};
