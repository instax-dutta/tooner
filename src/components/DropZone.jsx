import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { getAcceptedTypes, isSupported } from '../utils/fileProcessors';

/**
 * Spacious DropZone component with generous whitespace
 */
export default function DropZone({ onFileSelect, isProcessing }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef(null);
    const dragCountRef = useRef(0);
    const dropZoneRef = useRef(null);
    const iconRef = useRef(null);
    const cornerRefs = useRef([]);

    // GSAP entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                cornerRefs.current,
                { opacity: 0, scale: 0 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: 'back.out(1.7)',
                    delay: 0.3,
                }
            );

            gsap.to(iconRef.current, {
                y: -8,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        });

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (isDragging && dropZoneRef.current) {
            gsap.to(dropZoneRef.current, {
                scale: 1.02,
                duration: 0.25,
                ease: 'power2.out',
            });
        } else if (dropZoneRef.current) {
            gsap.to(dropZoneRef.current, {
                scale: 1,
                duration: 0.25,
                ease: 'power2.out',
            });
        }
    }, [isDragging]);

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
                    const file = item.getAsFile();
                    if (file) {
                        validateAndSelectFile(file);
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

    const formatPills = ['pdf', 'docx', 'xlsx', 'csv', 'json', 'md', 'txt'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-6 py-12"
        >
            {/* Welcome Text - More breathing room */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center mb-12 sm:mb-16"
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
                    <span className="gradient-text">Toonify</span>{' '}
                    <span className="text-[--text-primary]">Your Documents</span>
                </h1>
                <p className="text-[--text-secondary] text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                    Convert any document to token-optimized .toon files.
                    <br />
                    <span className="text-[--success] font-medium">100% lossless</span> — all your data is preserved.
                </p>
            </motion.div>

            {/* Main Drop Zone - Larger, more spacious */}
            <motion.div
                ref={dropZoneRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`drop-zone w-full max-w-2xl aspect-[2/1] sm:aspect-[2.5/1]
                    flex flex-col items-center justify-center relative overflow-hidden
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
                {/* Ambient glow */}
                <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none
                        ${isDragging || isHovering ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                          w-[200%] h-[200%] bg-[radial-gradient(circle,_var(--accent-glow)_0%,_transparent_50%)]
                          opacity-30" />
                </div>

                {/* Icon */}
                <div ref={iconRef} className="mb-6">
                    <motion.div
                        animate={isDragging ? { scale: 1.15 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                        <svg
                            className={`w-16 h-16 sm:w-20 sm:h-20 transition-colors duration-200
                         ${isDragging ? 'text-[--accent]' : isHovering ? 'text-[--text-primary]' : 'text-[--text-secondary]'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </motion.div>
                </div>

                {/* Text */}
                <div className="text-center z-10 px-6">
                    <motion.h2
                        className="text-xl sm:text-2xl font-semibold text-[--text-primary] mb-3"
                        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
                    >
                        {isDragging ? (
                            <span className="text-[--accent]">Release to toonify!</span>
                        ) : (
                            'Drop your file here'
                        )}
                    </motion.h2>
                    <p className="text-[--text-secondary] text-sm sm:text-base">
                        or{' '}
                        <span className="text-[--accent] hover:text-[--accent-hover] underline decoration-dotted underline-offset-4 cursor-pointer">
                            click to browse
                        </span>
                        {' '} • {' '}
                        <kbd className="px-2 py-1 bg-[--bg-tertiary] rounded text-xs font-mono">Ctrl+V</kbd>
                        {' '}to paste
                    </p>
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAcceptedTypes()}
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="File upload"
                />

                {/* Animated corners - larger */}
                <div ref={(el) => cornerRefs.current[0] = el}
                    className={`absolute top-4 left-4 sm:top-6 sm:left-6 w-6 h-6 sm:w-8 sm:h-8 
                        border-l-2 border-t-2 rounded-tl-lg transition-colors duration-200
                        ${isDragging ? 'border-[--accent]' : 'border-[--border]'}`} />
                <div ref={(el) => cornerRefs.current[1] = el}
                    className={`absolute top-4 right-4 sm:top-6 sm:right-6 w-6 h-6 sm:w-8 sm:h-8 
                        border-r-2 border-t-2 rounded-tr-lg transition-colors duration-200
                        ${isDragging ? 'border-[--accent]' : 'border-[--border]'}`} />
                <div ref={(el) => cornerRefs.current[2] = el}
                    className={`absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-6 h-6 sm:w-8 sm:h-8 
                        border-l-2 border-b-2 rounded-bl-lg transition-colors duration-200
                        ${isDragging ? 'border-[--accent]' : 'border-[--border]'}`} />
                <div ref={(el) => cornerRefs.current[3] = el}
                    className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-6 h-6 sm:w-8 sm:h-8 
                        border-r-2 border-b-2 rounded-br-lg transition-colors duration-200
                        ${isDragging ? 'border-[--accent]' : 'border-[--border]'}`} />
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="mt-6 px-5 py-3 bg-[--error]/10 border border-[--error]/20 
                       rounded-xl text-[--error] text-sm flex items-center gap-3"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Supported formats - More spacing */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-12 sm:mt-16 text-center"
            >
                <p className="text-[--text-muted] text-sm mb-4">Supports 30+ formats</p>
                <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                    {formatPills.map((ext, i) => (
                        <motion.span
                            key={ext}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.04 }}
                            className="px-3 py-1.5 rounded-full bg-[--bg-secondary] border border-[--border]
                         text-[--text-secondary] text-sm font-mono
                         hover:border-[--accent] hover:text-[--accent] 
                         transition-colors duration-150 cursor-default"
                        >
                            .{ext}
                        </motion.span>
                    ))}
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.78 }}
                        className="px-3 py-1.5 text-[--text-muted] text-sm"
                    >
                        +23 more
                    </motion.span>
                </div>
            </motion.div>

            {/* Footer attribution - More space */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-16 sm:mt-20"
            >
                <a
                    href="https://sdad.pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[--text-muted] hover:text-[--text-secondary] transition-colors"
                >
                    Made by sdad.pro
                </a>
            </motion.div>
        </motion.div>
    );
}
