import { detectFileType } from './fileTypeDetector.js';

export const PRIORITY_SPECIFIC = 0;
export const PRIORITY_GENERIC = 10;

export class ConversionError extends Error {
  /**
   * @param {Array<{converter: string, error: Error}>} attempts
   */
  constructor(attempts) {
    const msg = attempts.length > 0
      ? `Conversion failed after ${attempts.length} attempts:\n${
          attempts.map(a => `  - ${a.converter}: ${a.error.message}`).join('\n')
        }`
      : 'No converter found for this file format';
    super(msg);
    this.name = 'ConversionError';
    this.attempts = attempts;
  }
}

export class ConverterRegistry {
  constructor() {
    /** @type {Array<{converter: import('./DocumentConverter.js').DocumentConverter, priority: number}>} */
    this._entries = [];
  }

  register(converter, priority = PRIORITY_SPECIFIC) {
    this._entries.push({ converter, priority });
  }

  /**
   * Detect file type, find matching converter, run conversion.
   * @param {File} file
   * @param {(pct: number) => void} onProgress
   * @returns {Promise<{content: string, format: string}>}
   */
  async convert(file, onProgress = () => {}) {
    const info = await detectFileType(file);
    return this._convert(file, info, onProgress);
  }

  /**
   * Convert with explicit StreamInfo (bypasses detection).
   * @param {File} file
   * @param {import('./StreamInfo.js').StreamInfo} info
   * @param {(pct: number) => void} onProgress
   * @returns {Promise<{content: string, format: string}>}
   */
  async convertWithInfo(file, info, onProgress = () => {}) {
    return this._convert(file, info, onProgress);
  }

  async _convert(file, info, onProgress) {
    const sorted = [...this._entries].sort((a, b) => a.priority - b.priority);
    const attempts = [];

    for (const { converter } of sorted) {
      let accepts;
      try {
        accepts = converter.accepts(info);
      } catch {
        accepts = false;
      }
      if (!accepts) continue;

      try {
        const result = await converter.convert(file, info, onProgress);
        if (result && result.content != null) {
          return result;
        }
      } catch (err) {
        attempts.push({ converter: converter.constructor.name, error: err });
      }
    }

    throw new ConversionError(attempts);
  }
}

export const registry = new ConverterRegistry();
