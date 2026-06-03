import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { formatSize, formatTokens, getToonFilename, createToonBlob } from '../utils/format';

function StatRow({ label, leftValue, leftSub, rightValue, rightSub, positive }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{label}</div>
                <span className="block text-lg sm:text-xl font-medium text-foreground font-mono tracking-tight">
                    {leftValue}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{leftSub}</span>
            </div>
            <svg className="w-4 h-4 text-muted-foreground mt-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="flex-1 min-w-0 text-right">
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5 opacity-0">{label}</div>
                <span className={`block text-lg sm:text-xl font-medium font-mono tracking-tight ${positive ? 'text-accent' : 'text-destructive'}`}>
                    {rightValue}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{rightSub}</span>
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
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out', delay: 0.25 }
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
            className="flex flex-col items-center justify-center min-h-full px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto"
        >
            <div ref={successRef} className="relative mb-3 sm:mb-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
                    border-2 border-accent bg-accent/10 shadow-lg shadow-accent/20">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl sm:text-3xl font-medium mb-1.5 sm:mb-2 text-center text-foreground"
            >
                {stats.tokenReduction > 0
                    ? `You saved ${stats.tokenReduction}% on tokens`
                    : 'Optimized for AI'}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-muted-foreground text-xs font-mono mb-3 sm:mb-4 text-center max-w-[80vw] truncate"
            >
                {file.name}
            </motion.p>

            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="card w-full max-w-sm sm:max-w-md p-4 sm:p-5 mb-3 sm:mb-4"
            >
                <StatRow
                    label="Size"
                    leftValue={formatSize(stats.originalSize)}
                    leftSub="Original"
                    rightValue={formatSize(stats.compressedSize)}
                    rightSub=".toon"
                    positive={compressionPositive}
                />

                <div className="my-3 border-t border-border" />

                <StatRow
                    label="Tokens"
                    leftValue={formatTokens(stats.originalTokens)}
                    leftSub="Raw"
                    rightValue={formatTokens(stats.optimizedTokens)}
                    rightSub="Optimized"
                    positive={true}
                />

                <div className="my-3 border-t border-border" />

                <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                        <span className={`text-xl sm:text-2xl font-medium leading-none ${compressionPositive ? 'text-accent' : 'text-destructive'}`}>
                            {compressionPositive ? `-${Math.abs(stats.sizeReduction)}%` : `+${Math.abs(stats.sizeReduction)}%`}
                        </span>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Size saved</div>
                    </div>
                    {stats.tokenReduction > 0 && (
                        <>
                            <div className="w-px h-8 bg-border" />
                            <div className="text-center">
                                <span className="text-xl sm:text-2xl font-medium leading-none text-accent">
                                    -{stats.tokenReduction}%
                                </span>
                                <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Tokens saved</div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-2 w-full max-w-sm sm:max-w-md flex-shrink-0"
            >
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn btn-primary flex-1 py-3 text-sm font-medium"
                >
                    {downloading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Downloading...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download .toon
                        </span>
                    )}
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="btn btn-secondary flex-1 py-3 text-sm font-medium"
                >
                    {copied ? (
                        <span className="flex items-center justify-center gap-2 text-accent">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Text
                        </span>
                    )}
                </motion.button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-3 sm:mt-4 flex flex-col items-center gap-2 sm:gap-3"
            >
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onReset}
                    className="btn btn-ghost py-2 px-4 text-xs font-medium"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Process Another
                </motion.button>

                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest mr-1">Feed to</span>
                    {['ChatGPT', 'Claude', 'Gemini'].map((name) => (
                        <span key={name}
                            className="inline-flex items-center px-2 py-0.5 bg-card border border-border rounded-full
                                text-[9px] font-medium text-secondary-foreground"
                        >
                            {name}
                        </span>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
