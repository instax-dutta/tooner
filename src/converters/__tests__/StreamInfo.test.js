import { describe, it, expect } from 'vitest';
import { createStreamInfo, copyStreamInfo } from '../StreamInfo.js';

describe('createStreamInfo', () => {
  it('returns frozen object with defaults', () => {
    const info = createStreamInfo();
    expect(Object.isFrozen(info)).toBe(true);
    expect(info.mimetype).toBeNull();
    expect(info.extension).toBeNull();
    expect(info.filename).toBeNull();
    expect(info.charset).toBeNull();
    expect(info.url).toBeNull();
  });

  it('sets provided values', () => {
    const info = createStreamInfo({
      mimetype: 'application/pdf',
      extension: '.pdf',
      filename: 'doc.pdf',
      charset: 'utf-8',
    });
    expect(info.mimetype).toBe('application/pdf');
    expect(info.extension).toBe('.pdf');
    expect(info.filename).toBe('doc.pdf');
    expect(info.charset).toBe('utf-8');
  });
});

describe('copyStreamInfo', () => {
  it('copies and overrides fields', () => {
    const base = createStreamInfo({ mimetype: 'text/plain', extension: '.txt' });
    const copy = copyStreamInfo(base, { extension: '.md' });
    expect(copy.mimetype).toBe('text/plain');
    expect(copy.extension).toBe('.md');
  });

  it('does not mutate original', () => {
    const base = createStreamInfo({ mimetype: 'text/plain' });
    copyStreamInfo(base, { mimetype: 'application/json' });
    expect(base.mimetype).toBe('text/plain');
  });
});
