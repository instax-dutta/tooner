import { describe, it, expect } from 'vitest';
import { getExtension, isSupported, getAcceptedTypes } from '../fileTypeDetector.js';

describe('getExtension', () => {
  it('returns lowercase extension with dot', () => {
    expect(getExtension('document.PDF')).toBe('.pdf');
    expect(getExtension('file.txt')).toBe('.txt');
    expect(getExtension('noext')).toBe('');
  });
});

describe('isSupported', () => {
  it('accepts known formats', () => {
    expect(isSupported('doc.pdf')).toBe(true);
    expect(isSupported('data.csv')).toBe(true);
    expect(isSupported('code.js')).toBe(true);
    expect(isSupported('readme.md')).toBe(true);
  });

  it('rejects unknown formats', () => {
    expect(isSupported('file.exe')).toBe(false);
    expect(isSupported('archive.zip')).toBe(false);
  });
});

describe('getAcceptedTypes', () => {
  it('returns comma-separated extensions', () => {
    const types = getAcceptedTypes();
    expect(types).toContain('.pdf');
    expect(types).toContain('.csv');
    expect(types).toContain('.js');
    expect(types).toContain('.md');
  });
});
