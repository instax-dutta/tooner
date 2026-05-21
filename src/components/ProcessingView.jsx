import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { formatSize } from '../utils/tokenizer';

export default function ProcessingView({ file, progress, onCancel }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                containerRef.current,
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' }
            );
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
            <div ref={containerRef} className="card w-full max-w-sm sm:max-w-md text-center p-8 sm:p-10 mb-8 sm:mb-10">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto mb-10">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="4"
                        />
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="hsl(var(--accent))"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${progress * 2.51} 251`}
                            animate={{ strokeDasharray: `${progress * 2.51} 251` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl sm:text-5xl font-medium text-foreground font-mono">
                            {Math.round(progress)}
                        </span>
                        <span className="text-xs text-muted-foreground tracking-widest">%</span>
                    </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-medium text-foreground mb-3">
                    Toonifying<span className="animate-pulse">...</span>
                </h3>
                <p className="text-secondary-foreground mb-1 truncate max-w-full font-mono text-sm">
                    {file.name}
                </p>
                <p className="text-muted-foreground text-sm mb-8">
                    {formatSize(file.size)}
                </p>

                <div className="progress-bar mb-6">
                    <motion.div
                        className="progress-bar-fill"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                <motion.p
                    key={currentStatus}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-accent text-sm font-medium mb-8 h-5"
                >
                    {currentStatus}
                </motion.p>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onCancel}
                    className="btn btn-secondary w-full py-3.5 text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Processing
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 text-sm"
            >
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-muted-foreground font-medium">Processing locally in your browser</span>
            </motion.div>
        </motion.div>
    );
}
