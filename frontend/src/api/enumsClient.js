// Moved from src/enumsClient.js
let cachedEnums = null;
let cachedEtag = null;
let lastFetchTs = 0;
let inflight = null; // promise guard
let attempt = 0;

const ENDPOINT = '/api/meta/enums/';
const MAX_AGE_MS = 60 * 1000;

export async function fetchEnums(force = false) {
  const now = Date.now();
  if (!force && cachedEnums && (now - lastFetchTs) < MAX_AGE_MS) return cachedEnums;
  if (inflight) return inflight; // reuse ongoing
  const run = async () => {
    try {
      const headers = {};
      if (cachedEtag) headers['If-None-Match'] = cachedEtag;
      const resp = await fetch(ENDPOINT, { headers });
      if (resp.status === 304) { lastFetchTs = now; return cachedEnums; }
      if (!resp.ok) {
        attempt += 1;
        if (attempt <= 3) {
          const backoff = Math.min(1000 * attempt, 3000);
          console.warn('Enums fetch failed', resp.status, 'retrying in', backoff, 'ms');
          await new Promise(r => setTimeout(r, backoff));
          inflight = null; // allow retry chain via new call
          return fetchEnums(force);
        }
        console.warn('Failed to fetch enums after retries', resp.status);
        return null;
      }
      const json = await resp.json();
      cachedEnums = json;
      cachedEtag = resp.headers.get('ETag');
      lastFetchTs = now;
      attempt = 0;
      return cachedEnums;
    } catch (e) {
      console.warn('Enums fetch error', e);
      return null;
    } finally { inflight = null; }
  };
  inflight = run();
  return inflight;
}

export function mapToChoices(list) { return Array.isArray(list) ? list.map(v => ({ id: v, name: v })) : []; }
