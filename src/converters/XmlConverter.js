import { DocumentConverter } from './DocumentConverter.js';

export class XmlConverter extends DocumentConverter {
  accepts(info) {
    const mime = info.mimetype?.toLowerCase() || '';
    const ext = info.extension?.toLowerCase() || '';
    return mime === 'application/xml' || mime === 'text/xml' || ext === '.xml';
  }

  async convert(file, info, onProgress) {
    onProgress(10);
    const content = await file.text();
    onProgress(50);
    const textContent = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      content: `[Structured XML]\n${content}\n\n[Text Content]\n${textContent}`,
      format: 'xml',
    };
  }
}
