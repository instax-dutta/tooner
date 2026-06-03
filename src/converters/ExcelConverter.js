import { DocumentConverter } from './DocumentConverter.js';

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export class ExcelConverter extends DocumentConverter {
  accepts(info) {
    const ext = info.extension?.toLowerCase() || '';
    return ext === '.xlsx' || ext === '.xls';
  }

  async convert(file, info, onProgress) {
    onProgress(10);
    const XLSX = await import('xlsx');
    const arrayBuffer = await readAsArrayBuffer(file);
    onProgress(40);

    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const allText = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      allText.push(`--- Sheet: ${sheetName} ---\n${csv}`);
    }

    onProgress(80);
    return {
      content: allText.join('\n\n'),
      format: info.extension.replace('.', ''),
    };
  }
}
