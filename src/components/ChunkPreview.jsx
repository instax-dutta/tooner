import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTokens } from '../utils/format';
import ChunkInspector from './ChunkInspector';

function ChunkCard({ chunk, index, onInspect }) {
  const [expanded, setExpanded] = useState(false);
  const preview = chunk.content?.slice(0, 200);
  const hasMore = (chunk.content?.length || 0) > 200;

  return (
    <div className="border border-border rounded-lg p-3 bg-card/50">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-muted-foreground">
            #{chunk.index + 1}
          </span>
          {chunk.heading && (
            <span className="text-xs font-medium text-foreground truncate">
              {chunk.heading}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-accent whitespace-nowrap">
            {formatTokens(chunk.tokens)}
          </span>
          <button
            onClick={() => onInspect(index)}
            className="text-muted-foreground hover:text-accent transition-colors cursor-pointer"
            title="Open in inspector"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono">
        {expanded ? chunk.content : preview}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-accent hover:text-accent/80 ml-1 cursor-pointer"
          >
            ...more
          </button>
        )}
        {expanded && hasMore && (
          <button
            onClick={() => setExpanded(false)}
            className="text-accent hover:text-accent/80 ml-1 cursor-pointer"
          >
            show less
          </button>
        )}
      </p>
    </div>
  );
}

export default function ChunkPreview({ chunks }) {
  const [inspectorIndex, setInspectorIndex] = useState(null);

  if (!chunks || chunks.length === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1 mt-3">
          {chunks.map((chunk, i) => (
            <ChunkCard
              key={chunk.index ?? i}
              chunk={chunk}
              index={i}
              onInspect={setInspectorIndex}
            />
          ))}
        </div>
      </motion.div>

      {inspectorIndex !== null && (
        <ChunkInspector
          chunks={chunks}
          initialIndex={inspectorIndex}
          onClose={() => setInspectorIndex(null)}
        />
      )}
    </>
  );
}
