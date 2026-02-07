import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAcceptedTypes, isSupported } from '../utils/fileProcessors';

export default function DropZone({ onFileSelect, isProcessing }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef(null);
    const dragCountRef = useRef(0);

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
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8 sm:py-12"
        >
            <motion.div
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} // Updated easing to resemble power3.out
                className="text-center mb-8 sm:mb-12 md:mb-16"
            >
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tight">
                    <span className="neon-text">Toonify</span>
                    <br />
                    <span className="text-foreground">Your Docs</span>
                </h1>
                <p className="text-muted-foreground text-sm xs:text-base sm:text-lg max-w-md sm:max-w-xl mx-auto leading-relaxed px-2">
                    Convert to token-optimized <span className="font-mono text-xs sm:text-sm">.toon</span> files
                    <br className="hidden xs:block" />
                    <span className="xs:inline hidden"> — </span>
                    <span className="text-green-500 font-medium">100% lossless</span>
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: -10 }}
                animate={{
                    opacity: 1,
                    scale: isDragging ? 1.02 : 1,
                    y: 0,
                    rotateX: 0,
                    rotate: isDragging ? 2 : 0
                }}
                transition={{
                    opacity: { duration: 0.6, delay: 0.4, ease: "backOut" }, // Use backOut (similar to back.out(1.5)) keyframe ease if available, or predefined ease
                    scale: { duration: 0.3, ease: "easeOut" },
                    rotate: { duration: 0.3, ease: "easeOut" },
                    default: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`drop-zone w-full max-w-lg sm:max-w-xl md:max-w-2xl aspect-[1.8/1] sm:aspect-[2/1]
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
                <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none rounded-2xl
                        ${isDragging || isHovering ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-40" />
                </div>

                <div className="mb-4 sm:mb-6">
                    <motion.div
                        animate={isDragging ? { scale: 1.2, rotate: 10 } : {
                            scale: 1,
                            rotate: [5, -5, 5],
                            y: [-12, 0, -12]
                        }}
                        transition={isDragging ? { type: 'spring', stiffness: 300, damping: 20 } : {
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                    >
                        <svg
                            className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 transition-all duration-300
                          ${isDragging ? 'text-primary drop-shadow-[0_0_20px_rgba(60,100,255,0.4)]'
                                    : isHovering ? 'text-accent'
                                        : 'text-muted-foreground'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </motion.div>
                </div>

                <div className="text-center z-10 px-4 sm:px-6">
                    <motion.h2
                        className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3"
                        animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                    >
                        {isDragging ? (
                            <span className="neon-text">Release to toonify!</span>
                        ) : (
                            <span className="text-foreground">Drop your file here</span>
                        )}
                    </motion.h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        or{' '}
                        <span className="text-primary hover:text-accent underline decoration-dotted 
                            underline-offset-4 cursor-pointer transition-colors">
                            browse
                        </span>
                        <span className="hidden xs:inline">{' '}•{' '}
                            <kbd className="px-1.5 py-0.5 bg-card border border-border rounded 
                            text-[10px] font-mono text-muted">⌘V</kbd></span>
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAcceptedTypes()}
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="File upload"
                />

                <div className={`absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 rounded-tl-xl
                        transition-colors duration-300
                        ${isDragging ? 'border-primary' : 'border-border'}`} />
                <div className={`absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 rounded-tr-xl
                        transition-colors duration-300
                        ${isDragging ? 'border-accent' : 'border-border'}`} />
                <div className={`absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 rounded-bl-xl
                        transition-colors duration-300
                        ${isDragging ? 'border-accent' : 'border-border'}`} />
                <div className={`absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 rounded-br-xl
                        transition-colors duration-300
                        ${isDragging ? 'border-primary' : 'border-border'}`} />
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 1 }} // Keeping scale same on exit to prevent weird shrink
                        className="mt-8 px-6 py-4 bg-destructive/10 border border-destructive/30 
                        rounded-2xl text-destructive text-sm flex items-center gap-3
                        shadow-[0_0_20px_rgba(255,69,58,0.2)]"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 text-muted-foreground text-sm"
            >
                Supports{' '}
                <span className="text-secondary">PDF, DOCX, Excel, CSV, JSON, Markdown</span>
                {' '}+{' '}
                <span className="text-primary">30 more</span>
            </motion.p>

            <motion.a
                href="https://sdad.pro"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-16 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
                Built by sdad.pro
            </motion.a>
        </motion.div>
    );
}
