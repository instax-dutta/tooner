export class DocumentConverter {
  /**
   * Quick check if this converter can handle the file based on StreamInfo metadata.
   * MUST NOT read from the file stream — only inspect StreamInfo properties.
   * @param {import('./StreamInfo.js').StreamInfo} _info
   * @returns {boolean}
   */
  accepts(_info) {
    throw new Error(`Subclass ${this.constructor.name} must implement accepts()`);
  }

  /**
   * Convert a file to extracted text content.
   * @param {File} _file - browser File object
   * @param {import('./StreamInfo.js').StreamInfo} _info - stream metadata
   * @param {(pct: number) => void} _onProgress - progress callback (0-100)
   * @returns {Promise<{content: string, format: string}>}
   */
  async convert(_file, _info, _onProgress) {
    throw new Error(`Subclass ${this.constructor.name} must implement convert()`);
  }
}
