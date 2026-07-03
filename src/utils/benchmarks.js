/**
 * Performance measurement utility for Tooner pipeline stages.
 * Uses performance.now() for sub-millisecond precision.
 */

/**
 * Measure execution time of an async function.
 * @param {string} label - Name of the measurement
 * @param {() => Promise<T>} fn - Async function to measure
 * @returns {Promise<{ result: T, elapsed: number }>}
 */
export async function measure(label, fn) {
  const start = performance.now();
  const result = await fn();
  const elapsed = performance.now() - start;
  console.log(`[benchmark] ${label}: ${elapsed.toFixed(1)}ms`);
  return { result, elapsed };
}

/**
 * Measure the full conversion pipeline for a file.
 * @param {File} file - Input file
 * @param {{ convert: Function }} registry - Converter registry
 * @param {{ generateToonFile: Function }} tokenizer - Tokenizer module
 * @returns {Promise<Object>} Timing results
 */
export async function benchmarkConversion(file, registry, tokenizer) {
  const timings = {};

  const { result: convertResult, elapsed: convertTime } = await measure('convert', () =>
    registry.convert(file, () => {})
  );
  timings.convert = convertTime;

  const { result: toonResult, elapsed: toonTime } = await measure('generateToonFile', () =>
    tokenizer.generateToonFile({
      originalFilename: file.name,
      originalFormat: convertResult.format,
      originalSize: file.size,
      rawContent: convertResult.content,
    })
  );
  timings.toonFile = toonTime;

  timings.total = timings.convert + timings.toonFile;
  timings.stats = toonResult.stats;

  return timings;
}
