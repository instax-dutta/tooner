import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { formatSize } from '../utils/tokenizer';

/**
 * Cyberpunk processing view with neon effects
 */
export default function ProcessingView({ file, progress, onCancel }) {
    const containerRef = useRef(null);
    const ringRef = useRef(null);
    const glowRef = useRef(null);

    // GSAP animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Container entrance
            gsap.fromTo(
                containerRef.current,
                { scale: 0.8, opacity: 0, filter: 'blur(20px)' },
                { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }
            );

            // Pulsing glow
            gsap.to(glowRef.current, {
                opacity: 0.8,
                scale: 1.1,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

            // Ring rotation
            gsap.to(ringRef.current, {
                rotation: 360,
                duration: 20,
                repeat: -1,
                ease: 'none',
            });
        });
        return () => ctx.revert();
    }, []);

    const statusMessages = [
        { threshold: 0, message: 'Initializing engine...' },
        { threshold: 15, message: 'Reading file data...' },
        { threshold: 35, message: 'Extracting content...' },
        { threshold: 55, message: 'Analyzing structure...' },
        { threshold: 75, message: 'Optimizing tokens...' },
        { threshold: 90, message: 'Generating .toon...' },
    ];

    const currentStatus = statusMessages.reduce(
        (acc, item) => (progress >= item.threshold ? item.message : acc),
        statusMessages[0].message
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-20 sm:py-24"
        >
            <div ref={containerRef} className="glass-card w-full max-w-sm sm:max-w-md text-center p-8 sm:p-10 mb-8 sm:mb-10">
                {/* Animated loader */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-10">
                    {/* Background glow */}
                    <div
                        ref={glowRef}
                        className="absolute inset-0 bg-[radial-gradient(circle,_var(--glow-cyan)_0%,_transparent_70%)] opacity-50"
                    />

                    {/* Outer rotating ring */}
                    <svg
                        ref={ringRef}
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 100"
                    >
                        <defs>
                            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="1" />
                                <stop offset="50%" stopColor="var(--neon-purple)" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="var(--neon-pink)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke="url(#ringGradient)"
                            strokeWidth="1"
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Progress circle */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="var(--bg-tertiary)"
                            strokeWidth="4"
                        />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="url(#progressGrad)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${progress * 2.51} 251`}
                            animate={{ strokeDasharray: `${progress * 2.51} 251` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            style={{ filter: 'drop-shadow(0 0 8px var(--glow-cyan))' }}
                        />
                        <defs>
                            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--neon-cyan)" />
                                <stop offset="50%" stopColor="var(--neon-purple)" />
                                <stop offset="100%" stopColor="var(--neon-pink)" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Percentage */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl sm:text-5xl font-bold neon-text font-mono">
                            {Math.round(progress)}
                        </span>
                        <span className="text-xs text-[--text-muted] tracking-widest">PERCENT</span>
                    </div>
                </div>

                {/* File info */}
                <h3 className="text-2xl sm:text-3xl font-bold text-[--text-primary] mb-3">
                    Toonifying<span className="animate-pulse">...</span>
                </h3>
                <p className="text-[--text-secondary] mb-1 truncate max-w-full font-mono text-sm">
                    {file.name}
                </p>
                <p className="text-[--text-muted] text-sm mb-8">
                    {formatSize(file.size)}
                </p>

                {/* Progress bar */}
                <div className="progress-bar mb-6">
                    <motion.div
                        className="progress-bar-fill"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                {/* Status */}
                <motion.p
                    key={currentStatus}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[--neon-cyan] text-sm font-medium mb-8 h-5"
                >
                    {currentStatus}
                </motion.p>

                {/* Cancel */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onCancel}
                    className="btn btn-secondary w-full py-3.5 text-sm font-semibold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Processing
                </motion.button>
            </div>

            {/* Privacy */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 text-sm"
            >
                <div className="w-2 h-2 rounded-full bg-[--neon-green] animate-pulse shadow-[0_0_10px_var(--glow-green)]" />
                <span className="text-[--text-muted] font-medium">Processing locally in your browser</span>
            </motion.div>
        </motion.div> >
    );
}
