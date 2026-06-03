export function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatTokens(tokens) {
  if (tokens < 1000) return tokens.toString();
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(2)}M`;
}

export function getToonFilename(originalFilename) {
  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  return `${baseName}.toon`;
}

export function createToonBlob(toonData) {
  const json = JSON.stringify(toonData, null, 2);
  return new Blob([json], { type: 'application/json' });
}
