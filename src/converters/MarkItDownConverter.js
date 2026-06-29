import { DocumentConverter } from './DocumentConverter.js';

const MARKITDOWN_EXTENSIONS = new Set([
  '.pdf', '.docx', '.pptx', '.xlsx', '.xls',
  '.html', '.htm', '.csv', '.json', '.xml',
  '.epub', '.txt', '.md', '.rtf',
]);

export class MarkItDownConverter extends DocumentConverter {
  accepts(info) {
    const ext = info.extension?.toLowerCase() || '';
    return MARKITDOWN_EXTENSIONS.has(ext);
  }

  async convert(file, info, onProgress) {
    onProgress(5);

    // Dynamic imports
    const { MarkItDown } = await import('@markitdownjs/core');
    onProgress(15);

    const parser = new MarkItDown();
    const registry = parser.getRegistry();

    // Dynamically load the correct converter package based on file extension
    const ext = info.extension?.toLowerCase() || '';
    onProgress(25);

    try {
      if (ext === '.pdf') {
        const { PdfConverter } = await import('@markitdownjs/pdf');
        registry.register(new PdfConverter());
      } else if (ext === '.docx') {
        const { DocxConverter } = await import('@markitdownjs/docx');
        registry.register(new DocxConverter());
      } else if (ext === '.pptx') {
        const { PptxConverter } = await import('@markitdownjs/pptx');
        registry.register(new PptxConverter());
      } else if (ext === '.xlsx' || ext === '.xls') {
        const { XlsxConverter } = await import('@markitdownjs/xlsx');
        registry.register(new XlsxConverter());
      } else if (ext === '.html' || ext === '.htm') {
        const { HtmlConverter } = await import('@markitdownjs/html');
        registry.register(new HtmlConverter());
      } else if (ext === '.csv') {
        const { CsvConverter } = await import('@markitdownjs/csv');
        registry.register(new CsvConverter());
      } else if (ext === '.xml') {
        const { XmlConverter } = await import('@markitdownjs/xml');
        registry.register(new XmlConverter());
      } else if (ext === '.epub') {
        const { EpubConverter } = await import('@markitdownjs/epub');
        registry.register(new EpubConverter());
      }
    } catch (loadErr) {
      console.warn(`Failed to load MarkItDownJS converter for ${ext}:`, loadErr);
    }

    onProgress(50);

    try {
      // MarkItDown convert accepts a File or Blob directly in browser
      const result = await parser.convert(file);
      onProgress(85);

      const content = result.markdown || result.text || '';
      const format = ext.replace('.', '') || 'txt';

      onProgress(100);
      return { content, format };
    } catch (err) {
      console.warn('MarkItDownJS conversion failed, falling back to other converters:', err);
      throw err;
    }
  }
}
