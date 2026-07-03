import { registry as _registry, PRIORITY_SPECIFIC, PRIORITY_FALLBACK, PRIORITY_GENERIC } from './Registry.js';
import { PlainTextConverter } from './PlainTextConverter.js';
import { MarkItDownConverter } from './MarkItDownConverter.js';

export { registry, ConverterRegistry, ConversionError, PRIORITY_SPECIFIC, PRIORITY_FALLBACK, PRIORITY_GENERIC } from './Registry.js';
export { DocumentConverter } from './DocumentConverter.js';
export { createStreamInfo, copyStreamInfo } from './StreamInfo.js';
export { detectFileType, getExtension, isSupported, getAcceptedTypes } from './fileTypeDetector.js';
export { PlainTextConverter } from './PlainTextConverter.js';
export { MarkItDownConverter } from './MarkItDownConverter.js';

let _builtinsRegistered = false;

export function registerBuiltinConverters() {
  if (_builtinsRegistered) return;
  _builtinsRegistered = true;

  // MarkItDownConverter is primary for all its supported types
  _registry.register(new MarkItDownConverter(), PRIORITY_SPECIFIC);

  // PlainText is the generic text/markdown fallback
  _registry.register(new PlainTextConverter(), PRIORITY_GENERIC);
}
