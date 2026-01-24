import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

/**
 * Slim, modern header with neon accents
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
            <div className="container h-14 sm:h-16 flex items-center justify-between">
                {/* Logo */}
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
                    <div className="hidden xs:flex flex-col">
                        <span className="text-base sm:text-lg font-semibold tracking-tight text-[--text-primary] leading-tight">
                            Tooner
                        </span>
                        <span className="text-[9px] text-[--text-muted] tracking-[0.2em] uppercase leading-none">
                            Token Engine
                        </span>
                    </div>
                    <span className="xs:hidden text-base font-semibold text-[--text-primary]">Tooner</span>
                </motion.a>

                {/* Privacy Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full 
                     bg-[--neon-green]/10 border border-[--neon-green]/30"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-[--neon-green] animate-pulse" />
                    <span className="text-xs font-medium text-[--neon-green]">Local</span>
                </motion.div>
            </div>
        </motion.header>
    );
}
