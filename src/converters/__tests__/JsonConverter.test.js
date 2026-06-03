import { describe, it, expect } from 'vitest';
import { JsonConverter } from '../JsonConverter.js';
import { createStreamInfo } from '../StreamInfo.js';

describe('JsonConverter', () => {
  const converter = new JsonConverter();

  it('accepts .json extension and application/json MIME', () => {
    expect(converter.accepts(createStreamInfo({ extension: '.json' }))).toBe(true);
    expect(converter.accepts(createStreamInfo({ mimetype: 'application/json' }))).toBe(true);
  });

  it('rejects non-JSON formats', () => {
    expect(converter.accepts(createStreamInfo({ extension: '.txt' }))).toBe(false);
    expect(converter.accepts(createStreamInfo({ extension: '.pdf' }))).toBe(false);
  });

  it('pretty-prints valid JSON', async () => {
    const file = new File(['{"a":1,"b":2}'], 'data.json', { type: 'application/json' });
    const info = createStreamInfo({ extension: '.json', mimetype: 'application/json' });
    const result = await converter.convert(file, info, () => {});
    expect(result.content).toBe(JSON.stringify({ a: 1, b: 2 }, null, 2));
    expect(result.format).toBe('json');
  });

  it('passes through invalid JSON as-is', async () => {
    const file = new File(['not json'], 'data.json', { type: 'application/json' });
    const info = createStreamInfo({ extension: '.json' });
    const result = await converter.convert(file, info, () => {});
    expect(result.content).toBe('not json');
  });
});
