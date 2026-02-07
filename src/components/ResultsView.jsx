import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { formatSize, formatTokens, getToonFilename, createToonBlob } from '../utils/tokenizer';

export default function ResultsView({ file, stats, toonFile, onReset }) {
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const containerRef = useRef(null);
    const successRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                successRef.current,
                { scale: 0, rotation: -180, opacity: 0 },
                { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'elastic.out(1, 0.6)', delay: 0.1 }
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
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-20 sm:py-24"
        >
            <div ref={successRef} className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
                        border-2 border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>

            <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-4xl sm:text-5xl font-black mb-2 text-center"
            >
                <span className="neon-text">Toonified!</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-sm sm:text-base font-mono mb-10 sm:mb-12 text-center max-w-[80vw] truncate"
            >
                {file.name}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-card w-full max-w-sm sm:max-w-md p-6 sm:p-8 mb-6 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <svg className="w-32 h-32 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                </div>

                <div className="flex flex-col relative z-10 items-center sm:items-start text-center sm:text-left">
                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Compression</span>
                    <div className="flex items-baseline gap-2 justify-center sm:justify-start w-full">
                        <span className={`text-5xl sm:text-6xl font-black leading-none ${stats.sizeReduction >= 0 ? 'text-accent' : 'text-warning'}`}>
                            {stats.sizeReduction >= 0 ? `-${Math.abs(stats.sizeReduction)}%` : `+${Math.abs(stats.sizeReduction)}%`}
                        </span>
                        <span className="text-muted-foreground font-medium text-sm">
                            {stats.sizeReduction >= 0 ? 'smaller' : 'larger'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8 relative z-10">
                    <div className="p-3 rounded-xl bg-background/50 border border-border">
                        <div className="text-xl sm:text-2xl font-bold text-foreground font-mono tracking-tight">
                            {formatSize(stats.originalSize)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 opacity-70">Original</div>
                    </div>
                    <div className={`p-3 rounded-xl border ${stats.sizeReduction >= 0 ? 'bg-accent/10 border-accent/20' : 'bg-warning/10 border-warning/20'}`}>
                        <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${stats.sizeReduction >= 0 ? 'text-accent' : 'text-warning'}`}>
                            {formatSize(stats.compressedSize)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 opacity-70">.toon</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card w-full max-w-sm sm:max-w-md p-6 sm:p-8 mb-10 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <svg className="w-32 h-32 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11 11H8.57l3.72-8.31c.21-.48-.12-1.03-.64-1.06-.21-.01-.4.07-.54.23l-7.44 8.5c-.32.36-.06.94.42.94h2.95l-3.72 8.31c-.21.48.12 1.03.64 1.06.21.01.4-.07.54-.23l7.44-8.5c.32-.36.06-.94-.42-.94z" /></svg>
                </div>

                <div className="flex flex-col relative z-10 items-center sm:items-start text-center sm:text-left">
                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Tokens</span>
                    <div className="flex items-baseline gap-2 justify-center sm:justify-start w-full">
                        <span className="text-5xl sm:text-6xl font-black leading-none text-green-500">
                            {stats.tokenReduction > 0 ? `-${stats.tokenReduction}%` : 'Fast'}
                        </span>
                        {stats.tokenReduction > 0 && <span className="text-muted-foreground font-medium text-sm">saved</span>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8 relative z-10">
                    <div className="p-3 rounded-xl bg-background/50 border border-border">
                        <div className="text-xl sm:text-2xl font-bold text-foreground font-mono tracking-tight">
                            {formatTokens(stats.originalTokens)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 opacity-70">Raw</div>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="text-xl sm:text-2xl font-bold text-green-500 font-mono tracking-tight">
                            {formatTokens(stats.optimizedTokens)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 opacity-70">Optimized</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-md"
            >
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn btn-primary flex-1 py-4 text-sm sm:text-base font-bold shadow-lg shadow-primary/20"
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopy}
                    className="btn btn-secondary flex-1 py-4 text-sm sm:text-base font-bold"
                >
                    {copied ? (
                        <span className="flex items-center justify-center gap-2 text-green-500">
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="mt-8 text-muted-foreground hover:text-foreground text-sm font-medium
                    flex items-center gap-2 transition-colors cursor-pointer py-2 px-4 rounded-lg hover:bg-card"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Process Another
            </motion.button>
        </motion.div>
    );
}
