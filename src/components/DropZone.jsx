import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAcceptedTypes, isSupported } from '../converters';

const SOCIAL_PROOF_BASE = 1842;
const SOCIAL_PROOF_LABELS = ['files optimized', 'docs converted', 'uploads processed'];

function useSocialProof() {
    const [count] = useState(() => {
        try {
            const stored = localStorage.getItem('tooner_runs');
            return SOCIAL_PROOF_BASE + (stored ? parseInt(stored, 10) : 0);
        } catch {
            return SOCIAL_PROOF_BASE;
        }
    });
    return count;
}

const FORMAT_BADGES = [
  { label: 'PDF', ext: '.pdf', icon: 'M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z' },
  { label: 'DOCX', ext: '.docx', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Excel', ext: '.xlsx', icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { label: 'CSV', ext: '.csv', icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h3m-3 0V5l3-3h10l3 3v2m-9 3v6m-3-3h6' },
  { label: 'Code', ext: null, icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
];

export default function DropZone({ onFileSelect, isProcessing }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [showFormats, setShowFormats] = useState(false);
    const fileInputRef = useRef(null);
    const dragCountRef = useRef(0);
    const proofCount = useSocialProof();
    const proofLabel = SOCIAL_PROOF_LABELS[proofCount % SOCIAL_PROOF_LABELS.length];

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCountRef.current++;
        if (!isProcessing) {
            setIsDragging(true);
            setError(null);
        }
    }, [isProcessing]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCountRef.current--;
        if (dragCountRef.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const validateAndSelectFile = useCallback((file) => {
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            setError('File too large. Maximum size is 100MB.');
            return;
        }

        if (!isSupported(file.name)) {
            const ext = file.name.split('.').pop();
            setError(`Unsupported format: .${ext}`);
            return;
        }

        setError(null);
        onFileSelect(file);
    }, [onFileSelect]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCountRef.current = 0;

        if (isProcessing) return;

        const files = e.dataTransfer?.files;
        if (files?.length > 0) {
            validateAndSelectFile(files[0]);
        }
    }, [isProcessing, validateAndSelectFile]);

    const handleClick = () => {
        if (!isProcessing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSelectFile(file);
            e.target.value = '';
        }
    };

    const handlePaste = useCallback((e) => {
        if (isProcessing) return;

        const items = e.clipboardData?.items;
        if (items) {
            for (const item of items) {
                if (item.kind === 'file') {
                    const itemFile = item.getAsFile();
                    if (itemFile) {
                        validateAndSelectFile(itemFile);
                        break;
                    }
                }
            }
        }
    }, [isProcessing, validateAndSelectFile]);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center h-full px-4 sm:px-6 py-6"
        >
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-center mb-4 sm:mb-6"
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium mb-2 leading-tight tracking-tight text-foreground">
                    Optimize any file for AI
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                    Stop overpaying for bloated tokens. Convert PDFs, docs, and data files to{' '}
                    <span className="font-mono text-secondary-foreground">.toon</span>
                    {' '}— <span className="text-accent font-medium">lossless</span>, private, free.
                </p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-muted-foreground/50 text-[11px] mt-3"
                >
                    <span className="text-accent/70 font-medium">{proofCount.toLocaleString()}</span>{' '}
                    {proofLabel} this week
                </motion.p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={`drop-zone w-full max-w-lg aspect-[3/1] sm:aspect-[3.5/1]
                    flex flex-col items-center justify-center relative select-none outline-none
                    ${isDragging ? 'dragging' : ''}
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleClick()}
                aria-label="Upload file"
            >
                <motion.div
                    animate={isDragging ? { y: -4 } : { y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-2 px-6"
                >
                    <svg
                        className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-300
                            ${isDragging ? 'text-accent' : 'text-muted-foreground'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>

                    <div className="text-center">
                        {isDragging ? (
                            <span className="text-lg sm:text-xl font-medium text-accent">
                                Release to convert
                            </span>
                        ) : (
                            <>
                                <span className="text-lg sm:text-xl font-medium text-foreground">
                                    Drop a file to see how much you save
                                </span>
                                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                                    or{' '}
                                    <span className="text-foreground hover:text-accent underline decoration-dotted
                                        underline-offset-4 cursor-pointer transition-colors">
                                        browse
                                    </span>
                                    <span className="hidden sm:inline">{' '}•{' '}
                                        <kbd className="px-1.5 py-0.5 bg-card border border-border rounded
                                            text-[10px] font-mono text-muted-foreground">⌘V</kbd>
                                    </span>
                                </p>
                            </>
                        )}
                    </div>
                </motion.div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAcceptedTypes()}
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="File upload"
                />
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="mt-3 px-4 py-2.5 bg-destructive/10 border border-destructive/30
                            rounded-xl text-destructive text-xs flex items-center gap-2 max-w-md"
                    >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 sm:mt-5 flex flex-col items-center gap-3"
            >
                <button
                    onClick={() => setShowFormats(!showFormats)}
                    className="text-muted-foreground hover:text-foreground text-xs font-medium
                        flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <svg className={`w-3 h-3 transition-transform duration-200 ${showFormats ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Supported formats ({FORMAT_BADGES.length} categories)
                </button>

                <AnimatePresence>
                    {showFormats && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap justify-center gap-1.5">
                                {FORMAT_BADGES.map((badge) => (
                                    <span
                                        key={badge.label}
                                        className="inline-flex items-center gap-1 px-2.5 py-1
                                            bg-card border border-border rounded-full
                                            text-[10px] font-medium text-secondary-foreground"
                                    >
                                        <svg className="w-3 h-3 text-muted-foreground" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
                                        </svg>
                                        {badge.label}
                                        {badge.ext && (
                                            <span className="text-muted-foreground font-mono text-[9px]">{badge.ext}</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground"
            >
                <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    100% private
                </span>
                <span className="w-px h-3 bg-border" />
                <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    500-page PDF: ~$1.60 → ~$0.48
                </span>
                <span className="w-px h-3 bg-border" />
                <a href="https://sdad.pro" target="_blank" rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors">
                    by sdad.pro
                </a>
            </motion.div>
        </motion.div>
    );
}
