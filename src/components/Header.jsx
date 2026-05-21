import { motion } from 'framer-motion';

export default function Header() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-7xl mt-4 px-4"
        >
            <div className="flex h-14 sm:h-16 items-center justify-between w-full rounded-xl bg-card border border-border px-4">
                <div className="flex-1" />

                <motion.a
                    href="https://tooner.sdad.pro"
                    className="flex items-center gap-3 group justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-primary">
                        <span className="text-lg sm:text-xl font-medium text-primary-foreground tracking-tighter">T</span>
                    </div>
                    <span className="text-lg sm:text-xl font-medium tracking-tight text-foreground">
                        Tooner
                    </span>
                </motion.a>

                <div className="flex-1" />
            </div>
        </motion.header>
    );
}
