import { registry as _registry, PRIORITY_SPECIFIC, PRIORITY_FALLBACK, PRIORITY_GENERIC } from './Registry.js';
import { PlainTextConverter } from './PlainTextConverter.js';
import { JsonConverter } from './JsonConverter.js';
import { XmlConverter } from './XmlConverter.js';
import { CsvConverter } from './CsvConverter.js';
import { ExcelConverter } from './ExcelConverter.js';
import { DocxConverter } from './DocxConverter.js';
import { PdfConverter } from './PdfConverter.js';
import { MarkItDownConverter } from './MarkItDownConverter.js';

export { registry, ConverterRegistry, ConversionError, PRIORITY_SPECIFIC, PRIORITY_FALLBACK, PRIORITY_GENERIC } from './Registry.js';
export { DocumentConverter } from './DocumentConverter.js';
export { createStreamInfo, copyStreamInfo } from './StreamInfo.js';
export { detectFileType, getExtension, isSupported, getAcceptedTypes } from './fileTypeDetector.js';
export { PlainTextConverter } from './PlainTextConverter.js';
export { JsonConverter } from './JsonConverter.js';
export { XmlConverter } from './XmlConverter.js';
export { CsvConverter } from './CsvConverter.js';
export { ExcelConverter } from './ExcelConverter.js';
export { DocxConverter } from './DocxConverter.js';
export { PdfConverter } from './PdfConverter.js';
export { MarkItDownConverter } from './MarkItDownConverter.js';

let _builtinsRegistered = false;

export function registerBuiltinConverters() {
  if (_builtinsRegistered) return;
  _builtinsRegistered = true;

  // MarkItDownConverter is primary for all its supported types
  _registry.register(new MarkItDownConverter(), PRIORITY_SPECIFIC);

  // PlainText is the generic text/markdown fallback
  _registry.register(new PlainTextConverter(), PRIORITY_GENERIC);

  // Individual browser-native/mammoth fallback converters
  _registry.register(new PdfConverter(), PRIORITY_FALLBACK);
  _registry.register(new DocxConverter(), PRIORITY_FALLBACK);
  _registry.register(new ExcelConverter(), PRIORITY_FALLBACK);
  _registry.register(new CsvConverter(), PRIORITY_FALLBACK);
  _registry.register(new JsonConverter(), PRIORITY_FALLBACK);
  _registry.register(new XmlConverter(), PRIORITY_FALLBACK);
}
