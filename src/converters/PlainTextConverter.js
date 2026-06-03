import { DocumentConverter } from './DocumentConverter.js';

const ACCEPTED_EXTENSIONS = new Set([
  '.txt', '.md', '.rtf',
  '.js', '.jsx', '.ts', '.tsx',
  '.py', '.java', '.cpp', '.c', '.h', '.hpp',
  '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt',
  '.html', '.css', '.scss', '.less',
  '.sql', '.sh', '.bash', '.zsh',
  '.yaml', '.yml', '.toml',
]);

export class PlainTextConverter extends DocumentConverter {
  accepts(info) {
    const ext = info.extension?.toLowerCase();
    const mime = info.mimetype?.toLowerCase() || '';

    if (ext && ACCEPTED_EXTENSIONS.has(ext)) return true;
    if (mime.startsWith('text/')) return true;
    if (mime === 'application/json' || mime === 'application/xml') return true;
    if (mime === 'application/markdown' || mime === 'text/markdown') return true;
    if (mime === 'application/rtf') return true;

    return false;
  }

  async convert(file, info, onProgress) {
    onProgress(10);
    const content = await file.text();
    onProgress(80);
    return { content, format: (info.extension || '.txt').replace('.', '') };
  }
}
