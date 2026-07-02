/**
 * Flow Return Handler
 *
 * Flow.cl calls `urlReturn` via POST from the user's browser after checkout.
 * Static hosting (SPA) cannot respond to POST — the browser sees a 405/404
 * and the user is stranded. This edge function accepts that POST (and GET),
 * then issues a 302 redirect back to the SPA `/pago-exitoso` route with the
 * Flow token in the query string.
 *
 * Configure the target origin via `?origin=https://implantx.cl` (or any
 * whitelisted lovable domain). Falls back to https://implantx.lovable.app.
 */

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(www\.)?implantx\.cl$/,
  /^https:\/\/app\.implantx\.cl$/,
  /^https:\/\/implantx\.lovable\.app$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.lovable\.app$/,
];

const DEFAULT_ORIGIN = 'https://implantx.lovable.app';

function pickOrigin(candidate: string | null): string {
  if (!candidate) return DEFAULT_ORIGIN;
  try {
    const u = new URL(candidate);
    const normalized = `${u.protocol}//${u.host}`;
    if (ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(normalized))) return normalized;
  } catch {}
  return DEFAULT_ORIGIN;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const origin = pickOrigin(url.searchParams.get('origin'));

  // Extract Flow token from either query (GET) or form body (POST).
  let token: string | null = url.searchParams.get('token');

  if (!token && req.method === 'POST') {
    const contentType = req.headers.get('content-type') || '';
    try {
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const form = await req.formData();
        token = (form.get('token') as string) || null;
      } else if (contentType.includes('application/json')) {
        const body = await req.json();
        token = body?.token || null;
      }
    } catch (e) {
      console.error('flow-return: failed parsing body', e);
    }
  }

  const target = `${origin}/pago-exitoso${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  console.log('flow-return redirecting to', target);

  return new Response(null, {
    status: 302,
    headers: { Location: target },
  });
});
