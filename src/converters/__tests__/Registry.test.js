import { describe, it, expect } from 'vitest';
import { ConverterRegistry, PRIORITY_SPECIFIC, PRIORITY_GENERIC, ConversionError } from '../Registry.js';
import { DocumentConverter } from '../DocumentConverter.js';

class MockPdfConverter extends DocumentConverter {
  accepts(info) {
    return info.extension === '.pdf' || info.mimetype === 'application/pdf';
  }
  async convert(_file, _info) {
    return { content: 'pdf content', format: 'pdf' };
  }
}

class MockTextConverter extends DocumentConverter {
  accepts(info) {
    return info.mimetype?.startsWith('text/') || info.extension === '.txt';
  }
  async convert(_file, _info) {
    return { content: 'text content', format: 'txt' };
  }
}

class FailingConverter extends DocumentConverter {
  accepts() { return true; }
  async convert() { throw new Error('conversion failed'); }
}

describe('ConverterRegistry', () => {
  it('routes to the right converter by extension', async () => {
    const reg = new ConverterRegistry();
    reg.register(new MockTextConverter(), PRIORITY_GENERIC);
    reg.register(new MockPdfConverter(), PRIORITY_SPECIFIC);

    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    const result = await reg.convert(file);
    expect(result.content).toBe('pdf content');
    expect(result.format).toBe('pdf');
  });

  it('falls back to generic converter when no specific matches', async () => {
    const reg = new ConverterRegistry();
    reg.register(new MockPdfConverter(), PRIORITY_SPECIFIC);
    reg.register(new MockTextConverter(), PRIORITY_GENERIC);

    const file = new File(['hello'], 'readme.txt', { type: 'text/plain' });
    const result = await reg.convert(file);
    expect(result.content).toBe('text content');
  });

  it('throws ConversionError when no converter accepts', async () => {
    const reg = new ConverterRegistry();
    const file = new File(['data'], 'unknown.xyz', { type: 'application/octet-stream' });
    await expect(reg.convert(file)).rejects.toThrow(ConversionError);
  });

  it('collects failed attempts on conversion error', async () => {
    const reg = new ConverterRegistry();
    reg.register(new FailingConverter(), PRIORITY_SPECIFIC);

    const file = new File(['data'], 'test.txt', { type: 'text/plain' });
    await expect(reg.convert(file)).rejects.toThrow(ConversionError);
  });

  it('prioritizes specific over generic converters', async () => {
    const reg = new ConverterRegistry();
    reg.register(new MockTextConverter(), PRIORITY_GENERIC);
    reg.register(new MockPdfConverter(), PRIORITY_SPECIFIC);

    const file = new File(['data'], 'test.pdf', { type: 'application/pdf' });
    const result = await reg.convert(file);
    expect(result.content).toBe('pdf content');
  });
});
