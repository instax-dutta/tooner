import { DocumentConverter } from './DocumentConverter.js';

export class CsvConverter extends DocumentConverter {
  accepts(info) {
    const mime = info.mimetype?.toLowerCase() || '';
    const ext = info.extension?.toLowerCase() || '';
    return mime === 'text/csv' || ext === '.csv';
  }

  async convert(file, info, onProgress) {
    onProgress(10);
    const Papa = await import('papaparse');
    const content = await file.text();
    onProgress(40);

    const parsed = Papa.default.parse(content, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.warn('CSV parsing warnings:', parsed.errors);
    }

    if (parsed.data.length === 0) {
      return { content: '', format: 'csv' };
    }

    const headers = Object.keys(parsed.data[0]);
    const lines = parsed.data.map(row =>
      headers.map(h => `${h}: ${row[h]}`).join(' | ')
    );

    onProgress(80);
    return {
      content: `Headers: ${headers.join(', ')}\n\n${lines.join('\n')}`,
      format: 'csv',
    };
  }
}
