import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { formatSize, formatTokens, getToonFilename, createToonBlob } from '../utils/tokenizer';

/**
 * Cyberpunk results view with celebration effects
 */
export default function ResultsView({ file, stats, toonFile, onReset }) {
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const containerRef = useRef(null);
    const successRef = useRef(null);
    const statsRef = useRef([]);

    // GSAP celebration animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Success icon burst
            gsap.fromTo(
                successRef.current,
                { scale: 0, rotation: -180, opacity: 0 },
                {
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.5)',
                    delay: 0.1
                }
            );

            // Stats stagger
            gsap.fromTo(
                statsRef.current,
                { y: 40, opacity: 0, scale: 0.8 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'back.out(1.5)',
                    delay: 0.4,
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
            className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6 py-12"
        >
            {/* Success icon with glow */}
            <div
                ref={successRef}
                className="relative w-24 h-24 sm:w-28 sm:h-28 mb-8"
            >
                {/* Glow rings */}
                <div className="absolute inset-0 rounded-full bg-[--neon-green]/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-[--neon-green]/10" />

                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full 
                       bg-gradient-to-br from-[--neon-green]/30 to-transparent
                       border border-[--neon-green]/50 success-glow">
                    <svg
                        className="w-12 h-12 sm:w-14 sm:h-14 text-[--neon-green]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ filter: 'drop-shadow(0 0 10px var(--glow-green))' }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            {/* Title */}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl font-bold mb-4"
            >
                <span className="neon-text">Toonified!</span>
            </motion.h2>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 mb-12"
            >
                <p className="text-[--text-secondary] font-mono text-sm truncate max-w-[200px] sm:max-w-sm">
                    {file.name}
                </p>
                <span className="px-3 py-1.5 rounded-full bg-[--neon-green]/10 
                        border border-[--neon-green]/30 text-[--neon-green]
                        text-xs font-bold tracking-wide">
                    LOSSLESS
                </span>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mb-12">
                <div ref={(el) => statsRef.current[0] = el} className="stat-card">
                    <div className="stat-value text-[--text-muted]">{formatTokens(stats.originalTokens)}</div>
                    <div className="stat-label">Original</div>
                </div>

                <div ref={(el) => statsRef.current[1] = el} className="stat-card">
                    <div className="stat-value text-[--neon-cyan]">{formatTokens(stats.optimizedTokens)}</div>
                    <div className="stat-label">Optimized</div>
                </div>

                <div ref={(el) => statsRef.current[2] = el} className="stat-card group">
                    <div className="stat-value text-[--neon-green]">-{stats.tokenReduction}%</div>
                    <div className="stat-label">Tokens Saved</div>
                </div>

                <div ref={(el) => statsRef.current[3] = el} className="stat-card">
                    <div className="stat-value text-[--neon-purple]">-{stats.sizeReduction}%</div>
                    <div className="stat-label">Compressed</div>
                </div>
            </div>

            {/* Details card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card w-full max-w-md mb-10 p-6"
            >
                <div className="flex items-center justify-between py-3 border-b border-[--glass-border]">
                    <span className="text-[--text-muted]">Original Size</span>
                    <span className="text-[--text-primary] font-mono">{formatSize(stats.originalSize)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[--glass-border]">
                    <span className="text-[--text-muted]">Compressed</span>
                    <span className="text-[--neon-cyan] font-mono">{formatSize(stats.compressedSize)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                    <span className="text-[--text-muted]">Tokens Saved</span>
                    <span className="text-[--neon-green] font-mono font-bold">
                        {formatTokens(stats.originalTokens - stats.optimizedTokens)}
                    </span>
                </div>
            </motion.div>

            {/* Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
            >
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn btn-primary flex-1 py-4 text-base"
                >
                    {downloading ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Downloading...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="btn btn-secondary flex-1 py-4 text-base"
                >
                    {copied ? (
                        <>
                            <svg className="w-5 h-5 text-[--neon-green]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-[--neon-green]">Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Text
                        </>
                    )}
                </motion.button>
            </motion.div>

            {/* Process another */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="mt-10 text-[--text-muted] hover:text-[--neon-cyan] text-base 
                   flex items-center gap-2 transition-colors cursor-pointer"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Process Another
            </motion.button>
        </motion.div>
    );
}
