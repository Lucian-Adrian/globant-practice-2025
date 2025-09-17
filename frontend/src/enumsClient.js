// Dynamic enums client helper.
// Fetches enum values from the backend meta endpoint with lightweight ETag caching
// and exposes a mapper to convert raw string arrays into react-admin choices.

let cachedEnums = null;
let cachedEtag = null;
let lastFetchTs = 0;

const ENDPOINT = '/api/meta/enums/';
const MAX_AGE_MS = 60 * 1000; // soft client cache window matching server Cache-Control (60s)

export async function fetchEnums(force = false) {
  const now = Date.now();
  if (!force && cachedEnums && (now - lastFetchTs) < MAX_AGE_MS) {
    return cachedEnums;
  }
  try {
    const headers = {};
    if (cachedEtag) headers['If-None-Match'] = cachedEtag;
    const resp = await fetch(ENDPOINT, { headers });
    if (resp.status === 304) {
      lastFetchTs = now;
      return cachedEnums; // not modified
    }
    if (!resp.ok) {
      console.warn('Failed to fetch enums', resp.status);
      return null;
    }
    const json = await resp.json();
    cachedEnums = json;
    cachedEtag = resp.headers.get('ETag');
    lastFetchTs = now;
    return cachedEnums;
  } catch (err) {
    console.warn('Enums fetch error', err);
    return null; // let caller fall back
  }
}

export function mapToChoices(list) {
  if (!Array.isArray(list)) return [];
  return list.map(v => ({ id: v, name: v }));
}
