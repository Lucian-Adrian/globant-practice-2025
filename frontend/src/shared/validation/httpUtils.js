/**
 * HTTP utility functions for validation API calls
 */

/**
 * Fetch JSON from an API endpoint
 * @param {string} url - The URL to fetch
 * @returns {Promise<any>} Parsed JSON response or empty array on error
 */
export async function getJson(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    return r.json();
  } catch {
    return [];
  }
}
