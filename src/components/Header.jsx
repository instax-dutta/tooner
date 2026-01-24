import { motion } from 'framer-motion';

/**
 * Compact header component with branding and privacy badge
 */
export default function Header({ onSettingsClick }) {
    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 glass h-14 sm:h-16"
        >
            <div className="container h-full flex items-center justify-between">
                {/* Logo */}
                <motion.a
                    href="https://tooner.sdad.pro"
                    className="flex items-center gap-2 sm:gap-3 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[--accent] flex items-center justify-center
                          shadow-lg shadow-[--accent-glow] group-hover:shadow-xl group-hover:shadow-[--accent-glow]
                          transition-shadow duration-200">
                        <span className="text-sm sm:text-base font-bold text-white">T</span>
                    </div>
                    <span className="text-base sm:text-lg font-semibold tracking-tight text-[--text-primary]">
                        Tooner
                    </span>
                </motion.a>

                {/* Right side */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Privacy Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="badge badge-success hidden xs:flex"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                        </svg>
                        <span className="text-xs font-medium">100% Local</span>
                    </motion.div>

                    {/* Settings Button */}
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onSettingsClick}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[--bg-tertiary] hover:bg-[--border]
                       flex items-center justify-center transition-colors duration-150
                       text-[--text-secondary] hover:text-[--text-primary] cursor-pointer
                       border border-transparent hover:border-[--border-hover]"
                        aria-label="Settings"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </motion.button>
                </div>
            </div>
        </motion.header>
    );
}
