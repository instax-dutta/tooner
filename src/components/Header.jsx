import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

export default function Header() {
    const logoRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(logoRef.current, {
                boxShadow: '0 8px 24px hsl(var(--primary) / 0.4)',
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        }, logoRef);
        return () => ctx.revert();
    }, []);

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 glass-card mx-auto max-w-7xl mt-4 px-4"
        >
            <div className="flex h-14 sm:h-16 items-center justify-between w-full">
                <div className="flex-1" /> {/* Spacer for centering */}

                <motion.a
                    href="https://tooner.sdad.pro"
                    className="flex items-center gap-3 group justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div
                        ref={logoRef}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
                        bg-gradient-to-br from-primary via-accent to-primary shadow-lg border border-white/10"
                    >
                        <span className="text-lg sm:text-xl font-black text-primary-foreground tracking-tighter">T</span>
                    </div>
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground uppercase">
                        Tooner
                    </span>
                </motion.a>

                <div className="flex-1" /> {/* Spacer for centering */}
            </div>
        </motion.header>
    );
}
