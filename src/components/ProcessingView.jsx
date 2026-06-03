import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { formatSize } from '../utils/format';

const STATUS_STAGES = [
    { threshold: 0, message: 'Initializing', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { threshold: 15, message: 'Reading file', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { threshold: 35, message: 'Extracting content', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { threshold: 55, message: 'Analyzing structure', icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h3m-3 0V5l3-3h10l3 3v2m-9 3v6m-3-3h6' },
    { threshold: 75, message: 'Optimizing tokens', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { threshold: 90, message: 'Generating .toon', icon: 'M5 13l4 4L19 7' },
];

function getCurrentStage(progress) {
    return STATUS_STAGES.reduce(
        (acc, item) => (progress >= item.threshold ? item : acc),
        STATUS_STAGES[0]
    );
}

export default function ProcessingView({ file, progress, onCancel }) {
    const containerRef = useRef(null);
    const stage = getCurrentStage(progress);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                containerRef.current,
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }
            );
        });
        return () => ctx.revert();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full px-4 sm:px-6 py-6"
        >
            <div ref={containerRef} className="card w-full max-w-sm sm:max-w-md text-center p-6 sm:p-8">
                <motion.div
                    key={stage.message}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center
                        bg-accent/10 border border-accent/20 mx-auto mb-4"
                >
                    <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-accent" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={stage.icon} />
                    </svg>
                </motion.div>

                <h3 className="text-xl sm:text-2xl font-medium text-foreground mb-2">
                    Optimizing for LLMs
                    <span className="inline-flex ml-1">
                        <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        >.</motion.span>
                        <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                        >.</motion.span>
                        <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                        >.</motion.span>
                    </span>
                </h3>

                <p className="text-secondary-foreground mb-1 truncate max-w-full font-mono text-xs">
                    {file.name}
                </p>
                <p className="text-muted-foreground text-xs mb-5">
                    {formatSize(file.size)}
                </p>

                <div className="progress-bar mb-4">
                    <motion.div
                        className="progress-bar-fill"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={stage.message}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="text-accent text-xs font-medium mb-4 h-4"
                    >
                        {Math.round(progress)}% — {stage.message}
                    </motion.p>
                </AnimatePresence>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onCancel}
                    className="btn btn-secondary w-full py-3 text-xs font-medium"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                </motion.button>
            </div>
        </motion.div>
    );
}
