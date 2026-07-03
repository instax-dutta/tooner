import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatSize, formatTokens, getToonFilename, createToonBlob } from '../utils/format';

export default function BatchResults({ results, onReset }) {
  const [downloading, setDownloading] = useState(false);

  const totalOriginalSize = results.reduce((sum, r) => sum + r.stats.originalSize, 0);
  const totalCompressedSize = results.reduce((sum, r) => sum + r.stats.compressedSize, 0);
  const totalOriginalTokens = results.reduce((sum, r) => sum + r.stats.originalTokens, 0);
  const totalOptimizedTokens = results.reduce((sum, r) => sum + r.stats.optimizedTokens, 0);
  const totalChunks = results.reduce((sum, r) => sum + (r.stats.chunks?.length || 0), 0);

  const overallSizeReduction = totalOriginalSize > 0
    ? Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)
    : 0;
  const overallTokenReduction = totalOriginalTokens > 0
    ? Math.round(((totalOriginalTokens - totalOptimizedTokens) / totalOriginalTokens) * 100)
    : 0;

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      const { zipSync, strToU8 } = await import('fflate');
      const files = {};
      for (const r of results) {
        const name = getToonFilename(r.filename);
        const blob = createToonBlob(r.toonFile);
        const text = await blob.text();
        files[name] = strToU8(text);
      }
      const zipped = zipSync(files);
      const blob = new Blob([zipped], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tooner-batch.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Batch download failed:', error);
    }
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg px-4"
    >
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-1">
          {results.length} files optimized
        </h2>
        <p className="text-xs text-muted-foreground">
          {formatTokens(totalOriginalTokens)} → {formatTokens(totalOptimizedTokens)} tokens · {totalChunks} chunks
        </p>
      </div>

      <div className="card p-3 mb-3 max-h-60 overflow-y-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-1.5 font-medium">File</th>
              <th className="text-right py-1.5 font-medium">Size</th>
              <th className="text-right py-1.5 font-medium">Tokens</th>
              <th className="text-right py-1.5 font-medium">Saved</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="py-1.5 font-mono text-foreground truncate max-w-[120px]" title={r.filename}>
                  {r.filename}
                </td>
                <td className="py-1.5 text-right text-muted-foreground">{formatSize(r.stats.originalSize)}</td>
                <td className="py-1.5 text-right text-muted-foreground">{formatTokens(r.stats.originalTokens)}</td>
                <td className="py-1.5 text-right text-accent font-medium">-{r.stats.tokenReduction}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-3 mb-3">
        <div className="flex items-center justify-around text-center">
          <div>
            <span className="text-lg sm:text-xl font-medium text-accent">-{overallSizeReduction}%</span>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Size saved</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <span className="text-lg sm:text-xl font-medium text-accent">-{overallTokenReduction}%</span>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Tokens saved</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <span className="text-lg sm:text-xl font-medium text-foreground font-mono">{totalChunks}</span>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Chunks</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadAll}
          disabled={downloading}
          className="btn btn-primary flex-1 py-3 text-sm font-medium"
        >
          {downloading ? 'Zipping...' : `Download All (${results.length})`}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="btn btn-secondary py-3 px-4 text-xs font-medium"
        >
          Reset
        </motion.button>
      </div>
    </motion.div>
  );
}
