import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { encodeShareData, buildShareUrl, isTooLargeToShare } from '../utils/share';

export default function ShareModal({ toonFile, onClose }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tooLarge, setTooLarge] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isTooLargeToShare(toonFile)) {
        setTooLarge(true);
        setLoading(false);
        return;
      }
      try {
        const hash = await encodeShareData(toonFile);
        if (!cancelled) {
          setUrl(buildShareUrl(hash));
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setTooLarge(true);
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [toonFile]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

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
          className="card w-full max-w-md p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground">Share .toon file</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-6">
              <svg className="w-6 h-6 text-accent animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs text-muted-foreground">Generating shareable link...</p>
            </div>
          ) : tooLarge ? (
            <div className="text-center py-4">
              <svg className="w-10 h-10 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-foreground font-medium mb-1">File too large to share</p>
              <p className="text-xs text-muted-foreground">
                This .toon file exceeds the URL length limit. Use the Download button instead.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground truncate focus:outline-none"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={handleCopy}
                  className="btn btn-primary px-4 py-2 text-xs font-medium whitespace-nowrap"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                This link contains the encrypted .toon data in the URL hash. The server never sees your document.
                Links expire after 7 days.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
