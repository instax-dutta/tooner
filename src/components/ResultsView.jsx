import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { formatSize, formatTokens, getToonFilename, createToonBlob } from '../utils/tokenizer';

/**
 * ResultsView component - Shows processing results with download options
 */
export default function ResultsView({ file, stats, toonFile, onReset }) {
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const containerRef = useRef(null);
    const statsRef = useRef([]);
    const successRef = useRef(null);

    // GSAP entrance animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Success icon pop
            gsap.fromTo(
                successRef.current,
                { scale: 0, rotation: -180 },
                { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.5)', delay: 0.1 }
            );

            // Staggered stat cards
            gsap.fromTo(
                statsRef.current,
                { y: 30, opacity: 0, scale: 0.9 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    stagger: 0.08,
                    ease: 'power3.out',
                    delay: 0.3,
                }
            );
        });
        return () => ctx.revert();
    }, []);

    const handleDownload = () => {
        setDownloading(true);

        try {
            const blob = createToonBlob(toonFile, file.name);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = getToonFilename(file.name);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }

        setTimeout(() => setDownloading(false), 1000);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(stats.rawContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-6 overflow-y-auto"
        >
            {/* Success icon with glow */}
            <div
                ref={successRef}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[--success]/20 
                   flex items-center justify-center mb-4
                   shadow-[0_0_40px_var(--success-muted)]"
            >
                <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-[--success]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            </div>

            {/* Title */}
            <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold text-[--text-primary] mb-2"
            >
                Toonified!
            </motion.h2>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-2 mb-6"
            >
                <p className="text-[--text-secondary] text-sm truncate max-w-[200px] sm:max-w-xs">
                    {file.name}
                </p>
                {stats.isToonFormat && (
                    <span className="px-2 py-0.5 rounded-full bg-[--accent]/20 text-[--accent] 
                           text-[10px] font-medium border border-[--accent]/30">
                        TOON
                    </span>
                )}
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg sm:max-w-xl md:max-w-2xl mb-6">
                <div ref={(el) => statsRef.current[0] = el} className="stat-card">
                    <div className="stat-value text-[--text-secondary]">{formatTokens(stats.originalTokens)}</div>
                    <div className="stat-label">Original</div>
                </div>

                <div ref={(el) => statsRef.current[1] = el} className="stat-card">
                    <div className="stat-value">{formatTokens(stats.optimizedTokens)}</div>
                    <div className="stat-label">Optimized</div>
                </div>

                <div ref={(el) => statsRef.current[2] = el} className="stat-card relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[--success]/10 to-transparent pointer-events-none" />
                    <div className="stat-value text-[--success]">-{stats.tokenReduction}%</div>
                    <div className="stat-label">Saved</div>
                </div>

                <div ref={(el) => statsRef.current[3] = el} className="stat-card">
                    <div className="stat-value text-[--accent]">-{stats.sizeReduction}%</div>
                    <div className="stat-label">Compressed</div>
                </div>
            </div>

            {/* Detailed comparison */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card w-full max-w-sm sm:max-w-md mb-6 p-4"
            >
                <div className="flex items-center justify-between py-2 border-b border-[--border]">
                    <span className="text-[--text-secondary] text-sm">Original Size</span>
                    <span className="text-[--text-primary] mono text-sm">{formatSize(stats.originalSize)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[--border]">
                    <span className="text-[--text-secondary] text-sm">Compressed</span>
                    <span className="text-[--text-primary] mono text-sm">{formatSize(stats.compressedSize)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                    <span className="text-[--text-secondary] text-sm">Tokens Saved</span>
                    <span className="text-[--success] mono text-sm font-semibold">
                        {formatTokens(stats.originalTokens - stats.optimizedTokens)}
                    </span>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-md"
            >
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn btn-primary flex-1 py-3"
                >
                    {downloading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Downloading...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download .toon
                        </>
                    )}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="btn btn-secondary flex-1 py-3"
                >
                    {copied ? (
                        <>
                            <svg className="w-4 h-4 text-[--success]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-[--success]">Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copy Content
                        </>
                    )}
                </motion.button>
            </motion.div>

            {/* Process Another */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="mt-6 text-[--text-secondary] hover:text-[--accent] text-sm 
                   flex items-center gap-2 transition-colors cursor-pointer"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Process Another File
            </motion.button>
        </motion.div>
    );
}
