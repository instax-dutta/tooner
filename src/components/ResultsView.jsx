import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { formatSize, formatTokens, getToonFilename, createToonBlob } from '../utils/format';

function StatRow({ label, leftValue, leftSub, rightValue, rightSub, positive }) {
    return (
        <div className="flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-medium text-foreground font-mono tracking-tight stat-value">
                        {leftValue}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{leftSub}</span>
                </div>
            </div>
            <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <div className="h-4" />
                <div className="flex items-baseline gap-2">
                    <span className={`text-2xl sm:text-3xl font-medium font-mono tracking-tight stat-value ${positive ? 'text-accent' : 'text-destructive'}`}>
                        {rightValue}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{rightSub}</span>
                </div>
            </div>
        </div>
    );
}

export default function ResultsView({ file, stats, toonFile, onReset }) {
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const containerRef = useRef(null);
    const successRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                successRef.current,
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: 'backOut(1.7)' }
            );
        });
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (!cardRef.current) return;
        const ctx = gsap.context(() => {
            const values = cardRef.current.querySelectorAll('.stat-value');
            gsap.fromTo(
                values,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.3 }
            );
        });
        return () => ctx.revert();
    }, []);

    const handleDownload = () => {
        setDownloading(true);
        try {
            const blob = createToonBlob(toonFile);
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

    const compressionPositive = stats.sizeReduction >= 0;

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-20 sm:py-24"
        >
            <div ref={successRef} className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
                    border-2 border-accent bg-accent/10 shadow-lg shadow-accent/20">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-4xl sm:text-5xl font-medium mb-2 text-center text-foreground"
            >
                {stats.tokenReduction > 0
                    ? `You saved ${stats.tokenReduction}% on tokens`
                    : 'Optimized for AI'}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-sm sm:text-base font-mono mb-8 sm:mb-10 text-center max-w-[80vw] truncate"
            >
                {file.name}
            </motion.p>

            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="card w-full max-w-sm sm:max-w-md p-6 sm:p-8 mb-8"
            >
                <StatRow
                    label="Size"
                    leftValue={formatSize(stats.originalSize)}
                    leftSub="Original"
                    rightValue={formatSize(stats.compressedSize)}
                    rightSub=".toon"
                    positive={compressionPositive}
                />

                <div className="my-6 border-t border-border" />

                <StatRow
                    label="Tokens"
                    leftValue={formatTokens(stats.originalTokens)}
                    leftSub="Raw"
                    rightValue={formatTokens(stats.optimizedTokens)}
                    rightSub="Optimized"
                    positive={true}
                />

                <div className="my-6 border-t border-border" />

                <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                        <span className={`text-3xl sm:text-4xl font-medium leading-none stat-value ${compressionPositive ? 'text-accent' : 'text-destructive'}`}>
                            {compressionPositive ? `-${Math.abs(stats.sizeReduction)}%` : `+${Math.abs(stats.sizeReduction)}%`}
                        </span>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Size saved</div>
                    </div>
                    {stats.tokenReduction > 0 && (
                        <>
                            <div className="w-px h-10 bg-border" />
                            <div className="text-center">
                                <span className="text-3xl sm:text-4xl font-medium leading-none text-accent stat-value">
                                    -{stats.tokenReduction}%
                                </span>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Tokens saved</div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-md"
            >
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn btn-primary flex-1 py-4 text-sm sm:text-base font-medium"
                >
                    {downloading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Downloading...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download .toon
                        </span>
                    )}
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="btn btn-secondary flex-1 py-4 text-sm sm:text-base font-medium"
                >
                    {copied ? (
                        <span className="flex items-center justify-center gap-2 text-accent">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Text
                        </span>
                    )}
                </motion.button>
            </motion.div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="mt-6 btn btn-ghost py-3 px-6 text-sm font-medium"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Process Another
            </motion.button>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-10 text-center"
            >
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Feed your .toon to</p>
                <div className="flex items-center justify-center gap-3">
                    {[
                        { name: 'ChatGPT', icon: 'M22 11.08C22 5.55 17.58 1.9 12.2 1.74 8.32 1.61 4.5 4.47 3.25 8.47c-.58 1.79-.54 3.62.12 5.39.65 1.74 1.77 3.18 3.18 4.23.62.46 1.17 1.04 1.56 1.7.4.7.62 1.5.62 2.31v1.4c0 .9.7 1.6 1.6 1.6h4.34c.9 0 1.6-.7 1.6-1.6v-1.16c0-1.98 1.31-3.72 3.18-4.32 1.69-.54 3.05-1.73 3.81-3.3.76-1.56.84-3.33.3-4.95-.13-.4-.35-.78-.62-1.1-.1-.1-.16-.23-.16-.36v-.9' },
                        { name: 'Claude', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z' },
                        { name: 'Gemini', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
                    ].map((llm) => (
                        <span key={llm.name}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-full
                                text-[11px] font-medium text-secondary-foreground"
                        >
                            <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={llm.icon} />
                            </svg>
                            {llm.name}
                        </span>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
