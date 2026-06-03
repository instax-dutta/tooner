/**
 * Immutable value object carrying metadata about a file stream.
 * Mirrors MarkItDown's StreamInfo dataclass.
 *
 * @typedef {Object} StreamInfo
 * @property {string|null} mimetype - MIME type (e.g. 'application/pdf')
 * @property {string|null} extension - File extension with dot (e.g. '.pdf')
 * @property {string|null} filename - Original filename
 * @property {string|null} charset - Character encoding (e.g. 'utf-8')
 * @property {string|null} url - Source URL if fetched remotely
 */

/**
 * Create an immutable StreamInfo value object.
 * @param {Object} opts
 * @param {string|null} [opts.mimetype]
 * @param {string|null} [opts.extension]
 * @param {string|null} [opts.filename]
 * @param {string|null} [opts.charset]
 * @param {string|null} [opts.url]
 * @returns {StreamInfo}
 */
export function createStreamInfo({
  mimetype = null,
  extension = null,
  filename = null,
  charset = null,
  url = null,
} = {}) {
  return Object.freeze({ mimetype, extension, filename, charset, url });
}

/**
 * Copy a StreamInfo with selective overrides.
 * @param {StreamInfo} info
 * @param {Partial<import('./StreamInfo.js').StreamInfo>} overrides
 * @returns {StreamInfo}
 */
export function copyStreamInfo(info, overrides) {
  return createStreamInfo({ ...info, ...overrides });
}
