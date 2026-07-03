import { motion } from 'framer-motion';
import { formatSize } from '../utils/format';

export default function BatchProgress({ files, currentIndex, currentProgress }) {
  const completed = files.slice(0, currentIndex);
  const current = files[currentIndex];
  const total = files.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card w-full max-w-lg p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">
          Processing {currentIndex + 1} of {total}
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          {Math.round((currentIndex / total) * 100)}%
        </span>
      </div>

      <div className="progress-bar mb-4">
        <motion.div
          className="progress-bar-fill"
          animate={{ width: `${(currentIndex / total) * 100 + (currentProgress / total)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {current && (
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-xs font-mono text-foreground truncate">{current.name}</span>
          <span className="text-xs text-muted-foreground ml-auto">{formatSize(current.size)}</span>
        </div>
      )}

      {completed.length > 0 && (
        <div className="border-t border-border pt-2 mt-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Completed</p>
          <div className="flex flex-wrap gap-1">
            {completed.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] text-accent">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                {f.name.length > 20 ? f.name.slice(0, 20) + '...' : f.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
