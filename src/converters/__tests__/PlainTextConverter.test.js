import { describe, it, expect } from 'vitest';
import { PlainTextConverter } from '../PlainTextConverter.js';
import { createStreamInfo } from '../StreamInfo.js';

describe('PlainTextConverter', () => {
  const converter = new PlainTextConverter();

  it('accepts text extensions', () => {
    expect(converter.accepts(createStreamInfo({ extension: '.txt' }))).toBe(true);
    expect(converter.accepts(createStreamInfo({ extension: '.md' }))).toBe(true);
    expect(converter.accepts(createStreamInfo({ extension: '.rtf' }))).toBe(true);
    expect(converter.accepts(createStreamInfo({ extension: '.js' }))).toBe(true);
    expect(converter.accepts(createStreamInfo({ extension: '.py' }))).toBe(true);
    expect(converter.accepts(createStreamInfo({ extension: '.html' }))).toBe(true);
    expect(converter.accepts(createStreamInfo({ extension: '.yaml' }))).toBe(true);
    expect(converter.accepts(createStreamInfo({ extension: '.toml' }))).toBe(true);
  });

  it('accepts text/* MIME types', () => {
    expect(converter.accepts(createStreamInfo({ mimetype: 'text/plain' }))).toBe(true);
    expect(converter.accepts(createStreamInfo({ mimetype: 'text/markdown' }))).toBe(true);
  });

  it('rejects binary formats', () => {
    expect(converter.accepts(createStreamInfo({ extension: '.pdf' }))).toBe(false);
    expect(converter.accepts(createStreamInfo({ extension: '.docx' }))).toBe(false);
  });

  it('converts text content', async () => {
    const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    const info = createStreamInfo({ extension: '.txt', mimetype: 'text/plain' });
    const result = await converter.convert(file, info, () => {});
    expect(result.content).toBe('hello world');
    expect(result.format).toBe('txt');
  });
});
