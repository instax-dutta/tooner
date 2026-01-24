import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { OPTIMIZATION_LEVELS } from '../utils/tokenizer';

/**
 * Premium Settings panel with enhanced UI
 */
export default function Settings({ isOpen, onClose, settings, onSettingsChange }) {
    const contentRef = useRef(null);

    // GSAP entrance animation for content
    useEffect(() => {
        if (isOpen && contentRef.current) {
            const items = contentRef.current.querySelectorAll('.settings-item');
            gsap.fromTo(
                items,
                { opacity: 0, x: 20 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.3,
                    stagger: 0.04,
                    ease: 'power3.out',
                    delay: 0.15,
                }
            );
        }
    }, [isOpen]);

    const optimizationData = {
        minimal: {
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'text-[--text-secondary]',
            bgColor: 'bg-[--text-secondary]/10',
        },
        balanced: {
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            color: 'text-[--accent]',
            bgColor: 'bg-[--accent]/10',
        },
        aggressive: {
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
            ),
            color: 'text-orange-400',
            bgColor: 'bg-orange-400/10',
        },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                        className="fixed top-0 right-0 h-full w-full max-w-[380px] z-50 overflow-hidden"
                    >
                        {/* Background */}
                        <div className="absolute inset-0 bg-[--bg-primary]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[--bg-secondary]/50 via-transparent to-transparent" />
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[--accent]/30 via-[--border] to-transparent" />

                        {/* Content */}
                        <div ref={contentRef} className="relative h-full flex flex-col">
                            {/* Header */}
                            <div className="settings-item flex items-center justify-between p-5 border-b border-[--border]">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[--accent]/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[--accent]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-semibold text-[--text-primary]">Settings</h2>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-xl bg-[--bg-tertiary] hover:bg-[--border] 
                             flex items-center justify-center cursor-pointer
                             text-[--text-secondary] hover:text-[--text-primary] transition-colors"
                                    aria-label="Close settings"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </motion.button>
                            </div>

                            {/* Scrollable content */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                {/* Optimization Level */}
                                <div className="settings-item">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                                            Optimization
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {Object.entries(OPTIMIZATION_LEVELS).map(([key, { name, description }]) => {
                                            const { icon, color, bgColor } = optimizationData[key];
                                            const isSelected = settings.optimizationLevel === key;

                                            return (
                                                <motion.button
                                                    key={key}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    onClick={() => onSettingsChange({ ...settings, optimizationLevel: key })}
                                                    className={`w-full p-4 rounded-xl text-left transition-all duration-150 
                                     relative overflow-hidden cursor-pointer
                            ${isSelected
                                                            ? 'bg-[--bg-tertiary] border-2 border-[--accent]'
                                                            : 'bg-[--bg-secondary] border border-[--border] hover:border-[--border-hover]'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                              ${isSelected ? bgColor : 'bg-[--bg-tertiary]'} ${isSelected ? color : 'text-[--text-muted]'}`}>
                                                            {icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className={`font-medium ${isSelected ? 'text-[--text-primary]' : 'text-[--text-secondary]'}`}>
                                                                    {name}
                                                                </span>
                                                                {isSelected && (
                                                                    <motion.div
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                                                        className="w-2 h-2 rounded-full bg-[--accent] shadow-[0_0_8px_var(--accent)]"
                                                                    />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-[--text-muted] mt-0.5">{description}</p>
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Privacy Section */}
                                <div className="settings-item">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                                            Privacy
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-[--success]/5 border border-[--success]/20">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[--success]/20 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-[--success]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[--text-primary]">100% Local Processing</p>
                                                    <p className="text-xs text-[--text-muted] mt-1">
                                                        Your files never leave your device.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-[--accent]/5 border border-[--accent]/20">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-[--accent]/20 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-[--accent]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-[--text-primary]">No Data Collection</p>
                                                    <p className="text-xs text-[--text-muted] mt-1">
                                                        Zero analytics or tracking.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Export Options */}
                                <div className="settings-item">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                                            Export
                                        </span>
                                    </div>

                                    <div className="p-4 rounded-xl bg-[--bg-secondary] border border-[--border]">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-[--text-primary]">Include Metadata</p>
                                                <p className="text-xs text-[--text-muted] mt-0.5">Add creation time and settings</p>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => onSettingsChange({ ...settings, includeMetadata: !settings.includeMetadata })}
                                                className={`toggle ${settings.includeMetadata ? 'active' : ''} cursor-pointer`}
                                                aria-label="Toggle include metadata"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* About */}
                                <div className="settings-item">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs font-medium text-[--text-muted] uppercase tracking-wider">
                                            About
                                        </span>
                                    </div>

                                    <div className="p-4 rounded-xl bg-[--bg-secondary] border border-[--border]">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-[--accent] flex items-center justify-center
                                      shadow-lg shadow-[--accent-glow]">
                                                <span className="text-lg font-bold text-white">T</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[--text-primary]">Tooner</p>
                                                <p className="text-xs text-[--text-muted]">Version 1.0.0</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-[--text-muted] leading-relaxed mb-3">
                                            Privacy-focused document tokenization using the official TOON format.
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <a
                                                href="https://sdad.pro"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-[--text-secondary] hover:text-[--accent] transition-colors cursor-pointer flex items-center gap-1.5"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                </svg>
                                                sdad.pro
                                            </a>
                                            <span className="text-[--border]">•</span>
                                            <a
                                                href="https://github.com/saidutta"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-[--text-secondary] hover:text-[--accent] transition-colors cursor-pointer flex items-center gap-1.5"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                                </svg>
                                                GitHub
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="settings-item p-5 border-t border-[--border]">
                                <p className="text-xs text-[--text-muted] text-center">
                                    Made with ⚡ by{' '}
                                    <a
                                        href="https://sdad.pro"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[--text-secondary] hover:text-[--accent] transition-colors cursor-pointer"
                                    >
                                        sdad.pro
                                    </a>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
