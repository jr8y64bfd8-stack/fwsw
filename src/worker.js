/* Fort Wayne Specialty Welding: quote form handler.

   Everything in ./public is served as static files; this Worker only runs for
   requests that don't match a file, which in practice means POST /api/quote.

   The browser sends one request body:
     "FWQ1" + 8-digit length + form details as JSON + attachments as a JSON array
   The attachments are already base64-encoded by the browser, so this Worker never
   decodes or re-encodes them: it checks the details, runs the spam check, and
   streams the attachments straight into the email request. That keeps the work
   per request tiny, well inside the free plan's CPU limit.

   Settings (Cloudflare dashboard > Workers > fwspecialtyweld > Settings):
     QUOTE_TO          where requests go (set in wrangler.jsonc)
     QUOTE_FROM        sender shown on the email (set in wrangler.jsonc; the domain
                       must be verified with the email service)
     RESEND_API_KEY    secret: API key from resend.com
     TURNSTILE_SECRET  secret: Cloudflare Turnstile secret key (spam check)
*/

const MAIL_API = 'https://api.resend.com/emails';
const TURNSTILE_API = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_META = 32 * 1024;                 // form details, as JSON
const MAX_FILES = 6;
const MAX_FILE = 10 * 1024 * 1024;          // per file, before encoding
const MAX_TOTAL = 12 * 1024 * 1024;         // all files, before encoding
const OK_EXT = /\.(jpe?g|png|webp|heic|heif|avif|gif|tiff?|bmp|pdf|dxf|dwg|step|stp|igs|iges)$/i;
const MAGIC = 'FWQ1';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/quote') {
      if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405, { Allow: 'POST' });
      try {
        return await handleQuote(request, env);
      } catch (err) {
        console.error('quote form error', err && err.stack || err);
        return json({ ok: false, error: 'server' }, 500);
      }
    }
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });
  }
};

async function handleQuote(request, env) {
  if (!env.RESEND_API_KEY || !env.QUOTE_TO || !env.QUOTE_FROM) {
    return json({ ok: false, error: 'not_configured', message: 'The form isn\'t switched on yet.' }, 503);
  }
  const length = Number(request.headers.get('content-length'));
  if (!request.body || !Number.isFinite(length) || length < 14) return json({ ok: false, error: 'bad_request' }, 400);
  if (length > MAX_META + Math.ceil(MAX_TOTAL * 4 / 3) + 64 * 1024) {
    return json({ ok: false, error: 'too_large', message: 'The files are too large to send through the form.' }, 413);
  }

  // read just the header and the form details; the attachments stay in the stream
  const reader = request.body.getReader();
  const buf = new Buffered(reader);
  const head = await buf.take(12);
  if (!head || dec(head.subarray(0, 4)) !== MAGIC) return json({ ok: false, error: 'bad_request' }, 400);
  const metaLen = Number(dec(head.subarray(4, 12)));
  if (!Number.isInteger(metaLen) || metaLen < 2 || metaLen > MAX_META) return json({ ok: false, error: 'bad_request' }, 400);
  const metaBytes = await buf.take(metaLen);
  if (!metaBytes) return json({ ok: false, error: 'bad_request' }, 400);
  let meta;
  try { meta = JSON.parse(dec(metaBytes)); } catch { return json({ ok: false, error: 'bad_request' }, 400); }

  // a filled-in hidden field means a bot: say thanks and drop it
  if (clean(meta.website, 200)) { reader.cancel().catch(() => {}); return json({ ok: true }); }

  const f = {
    name: clean(meta.name, 100), company: clean(meta.company, 120), email: clean(meta.email, 200),
    phone: clean(meta.phone, 40), service: clean(meta.service, 80), details: clean(meta.details, 4000, true),
    material: clean(meta.material, 120), quantity: clean(meta.quantity, 20), needed_by: clean(meta.needed_by, 10),
    where: clean(meta.where, 40)
  };
  if (!f.name || !f.details || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    return json({ ok: false, error: 'invalid', message: 'Please fill in your name, email and a short description.' }, 400);
  }
  const files = Array.isArray(meta.files) ? meta.files : [];
  if (files.length > MAX_FILES) return json({ ok: false, error: 'too_many_files', message: `Up to ${MAX_FILES} files.` }, 400);
  let sum = 0;
  for (const file of files) {
    const n = clean(file && file.name, 200), size = Number(file && file.size);
    if (!n || !OK_EXT.test(n) || !(size > 0) || size > MAX_FILE) return json({ ok: false, error: 'bad_file', message: 'One of the files can\'t be sent through the form.' }, 400);
    sum += size;
  }
  if (sum > MAX_TOTAL) return json({ ok: false, error: 'too_large', message: 'The files are too large to send through the form.' }, 413);
  const attLen = length - 12 - metaLen;
  if (attLen < 2 || attLen > Math.ceil(sum * 4 / 3) + files.length * 1100 + 16) return json({ ok: false, error: 'bad_request' }, 400);

  // spam check
  if (env.TURNSTILE_SECRET) {
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', clean(meta.token, 2048));
    const ip = request.headers.get('cf-connecting-ip');
    if (ip) form.append('remoteip', ip);
    const v = await fetch(env.TURNSTILE_API || TURNSTILE_API, { method: 'POST', body: form }).then(r => r.json()).catch(() => null);
    if (!v || !v.success) return json({ ok: false, error: 'spam_check', message: 'The spam check didn\'t go through. Refresh the page and try again.' }, 403);
  }

  // the email: details as text and HTML, attachments streamed through untouched
  const subject = ('Quote request: ' + (f.service || 'General') + ' – ' + f.name + (f.company ? ' (' + f.company + ')' : '')).slice(0, 200);
  const rows = [
    ['Name', f.name], ['Company', f.company], ['Email', f.email], ['Phone', f.phone],
    ['Type of work', f.service], ['Material', f.material], ['Quantity', f.quantity],
    ['Needed by', f.needed_by], ['Drop-off or on-site', f.where],
    ['Files', files.map(x => clean(x.name, 200)).join(', ')]
  ].filter(r => r[1]);
  const text = rows.map(r => r[0] + ': ' + r[1]).join('\n') + '\n\n' + f.details + '\n\nReply to this email to answer ' + f.name + ' directly.\n';
  const html = '<div style="font:15px/1.5 -apple-system,Segoe UI,Arial,sans-serif;color:#14213A">'
    + '<h2 style="margin:0 0 12px;font-size:18px;color:#0B2D63">New quote request from the website</h2>'
    + '<table style="border-collapse:collapse">' + rows.map(r => '<tr><td style="padding:4px 16px 4px 0;color:#4A5568;vertical-align:top;white-space:nowrap">' + esc(r[0]) + '</td><td style="padding:4px 0">' + esc(r[1]) + '</td></tr>').join('') + '</table>'
    + '<p style="margin:16px 0 4px;color:#4A5568">Job description</p>'
    + '<p style="margin:0;white-space:pre-wrap">' + esc(f.details) + '</p>'
    + '<p style="margin:20px 0 0;color:#4A5568;font-size:13px">Reply to this email to answer ' + esc(f.name) + ' directly.</p></div>';

  const prefix = enc(JSON.stringify({
    from: env.QUOTE_FROM, to: [env.QUOTE_TO], reply_to: f.email, subject, text, html
  }).slice(0, -1) + ',"attachments":');
  const suffix = enc('}');
  const total = prefix.byteLength + attLen + suffix.byteLength;

  let body, pump;
  if (typeof FixedLengthStream === 'function') {
    const { readable, writable } = new FixedLengthStream(total);
    const writer = writable.getWriter();
    pump = (async () => {
      await writer.write(prefix);
      for (const chunk of buf.rest()) await writer.write(chunk);
      for (;;) { const { value, done } = await reader.read(); if (done) break; await writer.write(value); }
      await writer.write(suffix);
      await writer.close();
    })();
    pump.catch(err => writer.abort(err).catch(() => {}));
    body = readable;
  } else {
    // fallback for local testing outside Cloudflare
    const chunks = [prefix, ...buf.rest()];
    for (;;) { const { value, done } = await reader.read(); if (done) break; chunks.push(value); }
    chunks.push(suffix);
    body = new Blob(chunks);
  }

  const res = await fetch(env.MAIL_API || MAIL_API, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body
  });
  if (pump) await pump.catch(() => {});
  if (!res.ok) {
    console.error('email service error', res.status, await res.text().catch(() => ''));
    return json({ ok: false, error: 'send_failed', message: 'Sorry, the form couldn\'t send.' }, 502);
  }
  return json({ ok: true });
}

// reads exact byte counts off a stream, keeping whatever it read past them
class Buffered {
  constructor(reader) { this.reader = reader; this.chunks = []; this.size = 0; }
  async take(n) {
    while (this.size < n) {
      const { value, done } = await this.reader.read();
      if (done) return null;
      this.chunks.push(value); this.size += value.byteLength;
    }
    const out = new Uint8Array(n);
    let off = 0;
    while (off < n) {
      const c = this.chunks[0], need = n - off;
      if (c.byteLength <= need) { out.set(c, off); off += c.byteLength; this.chunks.shift(); }
      else { out.set(c.subarray(0, need), off); this.chunks[0] = c.subarray(need); off = n; }
    }
    this.size -= n;
    return out;
  }
  rest() { const r = this.chunks; this.chunks = []; this.size = 0; return r; }
}

function clean(v, max, multiline) {
  if (typeof v !== 'string') return '';
  let s = v.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '');
  if (!multiline) s = s.replace(/\s+/g, ' ');
  return s.trim().slice(0, max);
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function enc(s) { return new TextEncoder().encode(s); }
function dec(b) { return new TextDecoder().decode(b); }
function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers } });
}
