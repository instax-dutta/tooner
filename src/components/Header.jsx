import { motion } from 'framer-motion';

/**
 * Clean, minimal header with branding only
 */
export default function Header() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 glass"
        >
            <div className="container h-16 sm:h-20 flex items-center justify-between">
                {/* Logo */}
                <motion.a
                    href="https://tooner.sdad.pro"
                    className="flex items-center gap-3 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[--accent] flex items-center justify-center
                          shadow-lg shadow-[--accent-glow] group-hover:shadow-xl group-hover:shadow-[--accent-glow]
                          transition-shadow duration-200">
                        <span className="text-lg sm:text-xl font-bold text-white">T</span>
                    </div>
                    <span className="text-lg sm:text-xl font-semibold tracking-tight text-[--text-primary]">
                        Tooner
                    </span>
                </motion.a>

                {/* Privacy Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full 
                     bg-[--success]/10 border border-[--success]/30"
                >
                    <svg className="w-4 h-4 text-[--success]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                    </svg>
                    <span className="text-sm font-medium text-[--success]">100% Local</span>
                </motion.div>
            </div>
        </motion.header>
    );
}
