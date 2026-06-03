import { DocumentConverter } from './DocumentConverter.js';

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export class DocxConverter extends DocumentConverter {
  accepts(info) {
    const mime = info.mimetype?.toLowerCase() || '';
    const ext = info.extension?.toLowerCase() || '';
    return ext === '.docx'
      || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  async convert(file, info, onProgress) {
    onProgress(10);
    const mammoth = await import('mammoth');
    const arrayBuffer = await readAsArrayBuffer(file);
    onProgress(40);

    const result = await mammoth.extractRawText({ arrayBuffer });
    onProgress(80);

    return {
      content: result.value,
      format: 'docx',
    };
  }
}
