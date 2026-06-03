import { createStreamInfo } from './StreamInfo.js';

const MAGIC_BYTES = [
  { signature: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf', ext: '.pdf' },
  { signature: [0x50, 0x4B, 0x03, 0x04], mime: null, ext: null }, // ZIP-based
  { signature: [0xD0, 0xCF, 0x11, 0xE0], mime: null, ext: null }, // OLE2-based
  { signature: [0xFF, 0xFE], mime: null, ext: null },              // UTF-16LE BOM
  { signature: [0xFE, 0xFF], mime: null, ext: null },              // UTF-16BE BOM
  { signature: [0xEF, 0xBB, 0xBF], mime: null, ext: null },        // UTF-8 BOM
];

const ZIP_EXTENSIONS = new Set([
  '.docx', '.xlsx', '.xlsm', '.pptx', '.odt', '.ods', '.odp',
]);

const MIME_TO_EXT = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-excel': '.xls',
  'text/csv': '.csv',
  'application/json': '.json',
  'application/xml': '.xml',
  'text/markdown': '.md',
  'text/plain': '.txt',
  'application/rtf': '.rtf',
  'text/yaml': '.yaml',
  'text/toml': '.toml',
  'text/html': '.html',
};

const EXT_TO_MIME = Object.fromEntries(
  Object.entries(MIME_TO_EXT).map(([m, e]) => [e, m])
);

const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.rtf', '.json', '.xml', '.yaml', '.toml',
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c',
  '.h', '.hpp', '.cs', '.go', '.rs', '.rb', '.php', '.swift',
  '.kt', '.html', '.css', '.scss', '.less', '.sql', '.sh', '.bash', '.zsh',
]);

const DATA_EXTENSIONS = new Set(['.csv', '.xlsx', '.xls']);

/**
 * Get file extension from filename.
 * @param {string} filename
 * @returns {string}
 */
export function getExtension(filename) {
  const i = filename.lastIndexOf('.');
  return i >= 0 ? filename.substring(i).toLowerCase() : '';
}

/**
 * Check if a file format is supported.
 * @param {string} filename
 * @returns {boolean}
 */
export function isSupported(filename) {
  const ext = getExtension(filename);
  return TEXT_EXTENSIONS.has(ext) || DATA_EXTENSIONS.has(ext) || ext === '.pdf';
}

/**
 * Build comma-separated accepted types string for <input accept>.
 * @returns {string}
 */
export function getAcceptedTypes() {
  return [...TEXT_EXTENSIONS, ...DATA_EXTENSIONS, '.pdf'].map(e => e).join(',');
}

/**
 * Guess the MIME type from an extension.
 * @param {string} ext - extension with dot
 * @returns {string|null}
 */
function extToMime(ext) {
  return EXT_TO_MIME[ext] || null;
}

/**
 * Detect file type by magic bytes, then fall back to MIME, then extension.
 * @param {File} file
 * @returns {Promise<import('./StreamInfo.js').StreamInfo>}
 */
export async function detectFileType(file) {
  let header = null;
  try {
    const buf = await file.slice(0, 4096).arrayBuffer();
    header = new Uint8Array(buf);
  } catch {
    // Can't read header, will rely on extension
  }

  let mimetype = null;
  let extension = null;

  // 1. Magic bytes detection
  if (header) {
    for (const { signature, mime, ext } of MAGIC_BYTES) {
      if (signature.every((b, i) => header[i] === b)) {
        if (mime) {
          mimetype = mime;
          extension = ext;
          break;
        }
        // ZIP or OLE2 — need extension to disambiguate
        const extFromName = getExtension(file.name);
        if (extFromName && (ZIP_EXTENSIONS.has(extFromName) || extFromName === '.xls')) {
          mimetype = extToMime(extFromName) || 'application/octet-stream';
          extension = extFromName;
        }
        break;
      }
    }
  }

  // 2. Fall back to browser-provided MIME type
  if (!mimetype && file.type) {
    mimetype = file.type;
    extension = MIME_TO_EXT[file.type] || getExtension(file.name);
  }

  // 3. Fall back to extension-only
  if (!extension) {
    extension = getExtension(file.name);
    mimetype = extToMime(extension) || 'text/plain';
  }

  // Determine charset for text-like formats
  let charset = null;
  if (mimetype && (mimetype.startsWith('text/') || extension === '.json' || extension === '.xml' || extension === '.md')) {
    charset = 'utf-8';
  }

  return createStreamInfo({
    mimetype,
    extension,
    filename: file.name,
    charset,
  });
}
