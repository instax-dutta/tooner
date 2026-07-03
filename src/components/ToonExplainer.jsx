import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToonExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-sm sm:max-w-md">
      <button
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-foreground text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        What is a .toon file?
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 bg-card border border-border rounded-lg text-xs text-muted-foreground leading-relaxed space-y-2">
              <p>
                A <span className="font-mono text-secondary-foreground">.toon</span> file is a compressed, token-optimized
                version of your document, ready to paste into any LLM.
              </p>
              <p>
                It contains the full text content (gzipped to save space), metadata about the original file,
                and pre-split chunks for RAG workflows.
              </p>
              <p>
                Open it with any text editor, or use the{' '}
                <span className="font-mono text-secondary-foreground">Copy Text</span> button to grab the
                optimized content directly.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
