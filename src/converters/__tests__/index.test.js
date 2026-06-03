import { describe, it, expect } from 'vitest';
import {
  DocumentConverter, createStreamInfo, copyStreamInfo,
  ConverterRegistry, ConversionError, registry, PRIORITY_SPECIFIC, PRIORITY_GENERIC,
  detectFileType, getExtension, isSupported, getAcceptedTypes,
  PlainTextConverter, JsonConverter, XmlConverter, CsvConverter,
  ExcelConverter, DocxConverter, PdfConverter, registerBuiltinConverters,
} from '../index.js';

describe('converters barrel exports', () => {
  it('exports all expected symbols', () => {
    expect(DocumentConverter).toBeDefined();
    expect(createStreamInfo).toBeInstanceOf(Function);
    expect(copyStreamInfo).toBeInstanceOf(Function);
    expect(ConverterRegistry).toBeDefined();
    expect(ConversionError).toBeDefined();
    expect(registry).toBeDefined();
    expect(PRIORITY_SPECIFIC).toBe(0);
    expect(PRIORITY_GENERIC).toBe(10);
    expect(detectFileType).toBeInstanceOf(Function);
    expect(getExtension).toBeInstanceOf(Function);
    expect(isSupported).toBeInstanceOf(Function);
    expect(getAcceptedTypes).toBeInstanceOf(Function);
    expect(PlainTextConverter).toBeDefined();
    expect(JsonConverter).toBeDefined();
    expect(XmlConverter).toBeDefined();
    expect(CsvConverter).toBeDefined();
    expect(ExcelConverter).toBeDefined();
    expect(DocxConverter).toBeDefined();
    expect(PdfConverter).toBeDefined();
    expect(registerBuiltinConverters).toBeInstanceOf(Function);
  });

  it('registerBuiltinConverters is idempotent', () => {
    const initialCount = registry._entries.length;
    registerBuiltinConverters();
    registerBuiltinConverters();
    expect(registry._entries.length).toBe(initialCount > 0 ? initialCount : 7);
  });
});
