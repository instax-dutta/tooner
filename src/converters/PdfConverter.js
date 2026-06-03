import { DocumentConverter } from './DocumentConverter.js';

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export class PdfConverter extends DocumentConverter {
  accepts(info) {
    const mime = info.mimetype?.toLowerCase() || '';
    const ext = info.extension?.toLowerCase() || '';
    return mime === 'application/pdf' || mime === 'application/x-pdf' || ext === '.pdf';
  }

  async convert(file, info, onProgress) {
    onProgress(10);
    const [pdfjs, workerUrl] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.default || workerUrl;

    const arrayBuffer = await readAsArrayBuffer(file);
    onProgress(30);

    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const textParts = [];
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      textParts.push(pageText);
      onProgress(30 + ((i / numPages) * 50));
    }

    onProgress(100);
    return {
      content: textParts.join('\n\n'),
      format: 'pdf',
    };
  }
}
