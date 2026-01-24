import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

/**
 * Minimal, clean header
 */
export default function Header() {
    const logoRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(logoRef.current, {
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(191, 90, 242, 0.3)',
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        });
        return () => ctx.revert();
    }, []);

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 glass-strong"
        >
            <div className="container h-14 sm:h-16 flex items-center justify-center">
                {/* Logo - Centered */}
                <motion.a
                    href="https://tooner.sdad.pro"
                    className="flex items-center gap-2.5 sm:gap-3 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div
                        ref={logoRef}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center
                       bg-gradient-to-br from-[--neon-cyan] via-[--neon-purple] to-[--neon-pink]"
                    >
                        <span className="text-base sm:text-lg font-bold text-[--bg-deep]">T</span>
                    </div>
                    <span className="text-base sm:text-lg font-semibold tracking-tight text-[--text-primary]">
                        Tooner
                    </span>
                </motion.a>
            </div>
        </motion.header>
    );
}
