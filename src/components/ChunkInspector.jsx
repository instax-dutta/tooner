import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTokens } from '../utils/format';

export default function ChunkInspector({ chunks, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');

  const chunk = chunks[index];
  const maxTokens = Math.max(...chunks.map((c) => c.tokens));

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setEditMode(false);
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(chunks.length - 1, i + 1));
    setEditMode(false);
  }, [chunks.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goPrev, goNext]);

  if (!chunk) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="card w-full max-w-2xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-foreground">
                Chunk {index + 1} of {chunks.length}
              </h3>
              {chunk.heading && (
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {chunk.heading}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent">{formatTokens(chunk.tokens)}</span>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Token distribution bar */}
          <div className="px-4 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-16">Tokens</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${(chunk.tokens / maxTokens) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground w-12 text-right">
                {chunk.tokens}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {editMode ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full min-h-[200px] bg-muted/50 border border-border rounded-lg p-3 text-xs font-mono text-foreground resize-none focus:outline-none focus:border-accent"
              />
            ) : (
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                {chunk.content}
              </pre>
            )}
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <button
              onClick={goPrev}
              disabled={index === 0}
              className="btn btn-ghost text-xs disabled:opacity-30 cursor-pointer"
            >
              ← Prev
            </button>

            {/* Chunk selector dots */}
            <div className="flex items-center gap-1 overflow-hidden max-w-[200px]">
              {chunks.map((c, i) => (
                <button
                  key={i}
                  onClick={() => { setIndex(i); setEditMode(false); }}
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer flex-shrink-0
                    ${i === index ? 'bg-accent' : 'bg-muted hover:bg-muted-foreground/30'}`}
                  title={c.heading || `Chunk ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={index === chunks.length - 1}
              className="btn btn-ghost text-xs disabled:opacity-30 cursor-pointer"
            >
              Next →
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
