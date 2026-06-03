import { DocumentConverter } from './DocumentConverter.js';

export class JsonConverter extends DocumentConverter {
  accepts(info) {
    const mime = info.mimetype?.toLowerCase() || '';
    const ext = info.extension?.toLowerCase() || '';
    return mime === 'application/json' || ext === '.json';
  }

  async convert(file, info, onProgress) {
    onProgress(10);
    const raw = await file.text();
    onProgress(40);
    try {
      const parsed = JSON.parse(raw);
      onProgress(70);
      return {
        content: JSON.stringify(parsed, null, 2),
        format: 'json',
      };
    } catch {
      return { content: raw, format: 'json' };
    }
  }
}
