import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { formatSize } from '../utils/tokenizer';

/**
 * ProcessingView component - Shows progress while processing file
 */
export default function ProcessingView({ file, progress, onCancel }) {
    const containerRef = useRef(null);
    const progressRef = useRef(null);

    // GSAP entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                containerRef.current,
                { scale: 0.95, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }
            );
        });
        return () => ctx.revert();
    }, []);

    // Pulse animation on progress update
    useEffect(() => {
        if (progressRef.current && progress > 0) {
            gsap.fromTo(
                progressRef.current,
                { scale: 1 },
                { scale: 1.02, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.inOut' }
            );
        }
    }, [Math.floor(progress / 10)]); // Pulse every 10%

    const statusMessages = [
        { threshold: 0, message: 'Initializing...' },
        { threshold: 10, message: 'Reading file...' },
        { threshold: 30, message: 'Extracting content...' },
        { threshold: 50, message: 'Analyzing structure...' },
        { threshold: 70, message: 'Optimizing tokens...' },
        { threshold: 90, message: 'Generating .toon file...' },
    ];

    const currentStatus = statusMessages.reduce((acc, item) =>
        progress >= item.threshold ? item.message : acc, statusMessages[0].message);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4"
        >
            <div ref={containerRef} className="card w-full max-w-sm sm:max-w-md text-center p-6 sm:p-8">
                {/* Animated loader */}
                <div ref={progressRef} className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 relative">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="var(--bg-tertiary)"
                            strokeWidth="6"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${progress * 2.64} 264`}
                            initial={{ strokeDasharray: '0 264' }}
                            animate={{ strokeDasharray: `${progress * 2.64} 264` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--accent)" />
                                <stop offset="100%" stopColor="var(--success)" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Percentage in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-bold text-[--text-primary] mono">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>

                {/* File info */}
                <h3 className="text-lg sm:text-xl font-semibold text-[--text-primary] mb-2">
                    Toonifying...
                </h3>
                <p className="text-[--text-secondary] text-sm mb-1 truncate max-w-full px-4">
                    {file.name}
                </p>
                <p className="text-[--text-muted] text-xs mb-6">
                    {formatSize(file.size)}
                </p>

                {/* Progress bar */}
                <div className="progress-bar mb-4">
                    <motion.div
                        className="progress-bar-fill"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Status message */}
                <motion.p
                    key={currentStatus}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[--text-secondary] text-sm mb-6 h-5"
                >
                    {currentStatus}
                </motion.p>

                {/* Cancel button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    className="btn btn-secondary text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                </motion.button>
            </div>

            {/* Privacy reminder */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-[--text-muted] text-xs flex items-center gap-2"
            >
                <svg className="w-3.5 h-3.5 text-[--success]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                </svg>
                Processing locally in your browser
            </motion.p>
        </motion.div>
    );
}
