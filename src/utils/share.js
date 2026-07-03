/**
 * Shareable .toon link utilities.
 * Encodes .toon data as a URL-safe string in the URL hash.
 * Client-side only — no server involved.
 */

import { compressContent, decompressContent } from './tokenizer';

/**
 * Encode a .toon file into a URL-safe hash string.
 * @param {Object} toonFile - The .toon file data
 * @returns {Promise<string>} URL hash string (without #)
 */
export async function encodeShareData(toonFile) {
  const json = JSON.stringify(toonFile);
  const { gzip, strToU8 } = await import('fflate');

  return new Promise((resolve, reject) => {
    const data = strToU8(json);
    gzip(data, { level: 9 }, (err, compressed) => {
      if (err) return reject(err);

      // Convert to base64url
      let binary = '';
      for (let i = 0; i < compressed.length; i++) {
        binary += String.fromCharCode(compressed[i]);
      }
      const base64 = btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      resolve(base64);
    });
  });
}

/**
 * Decode a shareable URL hash back to a .toon file.
 * @param {string} hash - The URL hash string (without #)
 * @returns {Promise<Object>} The .toon file data
 */
export async function decodeShareData(hash) {
  // Restore base64 padding
  let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const { gunzip, strFromU8 } = await import('fflate');

  return new Promise((resolve, reject) => {
    gunzip(bytes, (err, decompressed) => {
      if (err) return reject(err);
      const json = strFromU8(decompressed);
      resolve(JSON.parse(json));
    });
  });
}

/**
 * Build a full shareable URL from a hash string.
 * @param {string} hash - Encoded hash data
 * @returns {string} Full URL
 */
export function buildShareUrl(hash) {
  const base = window.location.origin + window.location.pathname;
  return `${base}#share=${hash}`;
}

/**
 * Check if the current URL has share data and attempt to decode it.
 * @returns {Promise<Object|null>} Decoded .toon file or null
 */
export async function checkForSharedData() {
  const hash = window.location.hash;
  if (!hash.startsWith('#share=')) return null;

  try {
    const data = hash.slice(7);
    const toonFile = await decodeShareData(data);
    // Clear the hash to avoid re-loading
    history.replaceState(null, '', window.location.pathname);
    return toonFile;
  } catch {
    return null;
  }
}

/**
 * Check if share data would exceed URL length limits.
 * @param {Object} toonFile
 * @returns {boolean} True if too large to share
 */
export function isTooLargeToShare(toonFile) {
  // Rough estimate: compressed JSON + URL encoding overhead
  // Browser URL limit is ~2000 chars for safety, 2MB actual
  // We use a conservative 200KB limit for the hash
  const estimated = JSON.stringify(toonFile).length * 0.3; // rough gzip ratio
  return estimated > 200000;
}
