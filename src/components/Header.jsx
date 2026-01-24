import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

/**
 * Funky cyberpunk header with neon accents
 */
export default function Header() {
    const logoRef = useRef(null);
    const badgeRef = useRef(null);

    // GSAP entrance animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Logo glow pulse
            gsap.to(logoRef.current, {
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.6), 0 0 60px rgba(191, 90, 242, 0.4)',
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });

            // Badge float
            gsap.to(badgeRef.current, {
                y: -3,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 glass-strong"
        >
            <div className="container h-18 sm:h-20 flex items-center justify-between py-4">
                {/* Logo */}
                <motion.a
                    href="https://tooner.sdad.pro"
                    className="flex items-center gap-3 sm:gap-4 group"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <div
                        ref={logoRef}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center
                       bg-gradient-to-br from-[--neon-cyan] via-[--neon-purple] to-[--neon-pink]
                       shadow-lg"
                    >
                        <span className="text-xl sm:text-2xl font-bold text-[--bg-deep]">T</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg sm:text-xl font-bold tracking-tight text-[--text-primary]">
                            Tooner
                        </span>
                        <span className="text-[10px] text-[--text-muted] tracking-widest uppercase hidden sm:block">
                            Token Engine
                        </span>
                    </div>
                </motion.a>

                {/* Privacy Badge */}
                <motion.div
                    ref={badgeRef}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-full 
                     bg-[--neon-green]/10 border border-[--neon-green]/30
                     shadow-[0_0_20px_rgba(50,215,75,0.15)]"
                >
                    <div className="w-2 h-2 rounded-full bg-[--neon-green] animate-pulse shadow-[0_0_10px_var(--glow-green)]" />
                    <span className="text-sm font-medium text-[--neon-green]">100% Local</span>
                </motion.div>
            </div>
        </motion.header>
    );
}
