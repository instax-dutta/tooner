import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Footer() {
    const year = new Date().getFullYear();
    const [activeModal, setActiveModal] = useState(null);

    const openModal = (type) => setActiveModal(type);
    const closeModal = () => setActiveModal(null);

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border-t border-border bg-background flex-shrink-0"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

                {/* Branding + copyright */}
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center bg-primary flex-shrink-0">
                        <span className="text-[11px] font-medium text-primary-foreground tracking-tighter">T</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                        © {year}{' '}
                        <a
                            href="https://sdad.pro"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground/70 hover:text-foreground transition-colors duration-150 underline-offset-2 hover:underline"
                        >
                            sdad.pro
                        </a>
                        {' '}— Tooner
                    </span>
                </div>

                {/* Links */}
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-end">
                    <button
                        onClick={() => openModal('how-it-works')}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150 font-medium cursor-pointer bg-transparent border-0"
                    >
                        How it works
                    </button>
                    <span className="w-px h-3 bg-border" />
                    <button
                        onClick={() => openModal('privacy')}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150 font-medium cursor-pointer bg-transparent border-0"
                    >
                        Privacy
                    </button>
                    <span className="w-px h-3 bg-border" />
                    <button
                        onClick={() => openModal('about')}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150 font-medium cursor-pointer bg-transparent border-0"
                    >
                        About
                    </button>
                    <span className="w-px h-3 bg-border" />
                    <a
                        href="https://github.com/instax-dutta/tooner"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub repository"
                        className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150 font-medium group"
                    >
                        <svg
                            className="w-3.5 h-3.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                    </a>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {activeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-card border border-border p-6 rounded-2xl shadow-2xl relative cursor-default text-foreground max-h-[85vh] overflow-y-auto"
                        >
                            {/* Close button */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors duration-150 border-0 bg-transparent cursor-pointer text-lg font-medium"
                                aria-label="Close modal"
                            >
                                ✕
                            </button>

                            {/* Modal Content */}
                            {activeModal === 'how-it-works' && (
                                <div>
                                    <h2 className="text-xl font-semibold tracking-tight mb-4 font-sans text-foreground">How Tooner Works</h2>
                                    <div className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent text-xs font-semibold flex-shrink-0">1</div>
                                            <div>
                                                <h3 className="font-semibold text-foreground mb-1">Local Extraction</h3>
                                                <p>Drop your file (PDF, DOCX, CSV, Excel, XML, HTML, etc.). The browser-based <strong>MarkItDownJS</strong> converter parses the document structure locally in your browser.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent text-xs font-semibold flex-shrink-0">2</div>
                                            <div>
                                                <h3 className="font-semibold text-foreground mb-1">Semantic Optimization</h3>
                                                <p>Format-aware tokenizers clean up the document: removing HTML/XML comments, collapsing multiple layout alignment spaces, simplifying link URLs, and cleaning markdown decorators.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent text-xs font-semibold flex-shrink-0">3</div>
                                            <div>
                                                <h3 className="font-semibold text-foreground mb-1">Context-Rich RAG Chunking</h3>
                                                <p>Content is chunked logically at markdown heading boundaries (#, ##). Large text blocks are carefully split on paragraph gaps under 2000 tokens to preserve retrieval accuracy.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-accent text-xs font-semibold flex-shrink-0">4</div>
                                            <div>
                                                <h3 className="font-semibold text-foreground mb-1">Gzip Base64 Compression</h3>
                                                <p>The optimized layout is compressed via gzip WebAssembly and encoded to a clean <code>.toon</code> file ready to download or copy.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'privacy' && (
                                <div>
                                    <h2 className="text-xl font-semibold tracking-tight mb-4 font-sans text-foreground">Privacy & Security</h2>
                                    <div className="space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                                        <p>
                                            At Tooner, we value your privacy above everything else. Because your documents contain sensitive personal or proprietary code data, we enforce a strict sandboxed execution policy:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 mt-2">
                                            <li>
                                                <strong className="text-foreground">100% Client-Side Processing:</strong> All file conversions, parsing, and token optimizations run completely inside your browser.
                                            </li>
                                            <li>
                                                <strong className="text-foreground">No File Uploads:</strong> We do not operate server backends. Your files never leave your device.
                                            </li>
                                            <li>
                                                <strong className="text-foreground">Zero Tracking:</strong> We do not store document fragments, set analytics tracking cookies, or collect telemetry.
                                            </li>
                                            <li>
                                                <strong className="text-foreground">Open-Source Codebase:</strong> Our source code is fully public on GitHub for auditable assurance.
                                            </li>
                                        </ul>
                                        <p className="mt-2 text-xs">
                                            You can inspect network requests in your browser console to verify that zero external payloads are transmitted during file processing.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'about' && (
                                <div>
                                    <h2 className="text-xl font-semibold tracking-tight mb-4 font-sans text-foreground">About the Project</h2>
                                    <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                                        <p>
                                            Tooner is designed to solve a major problem for AI and RAG applications: <strong>inflated token costs</strong> and <strong>layout formatting noise</strong>.
                                        </p>
                                        <p>
                                            By combining AST-based markdown parsers with format-specific regex compressors, Tooner lets developers clean, chunk, and packaging documents into token-efficient forms before pasting or feeding them to LLMs like GPT-4, Claude 3.5, or Gemini 1.5.
                                        </p>
                                        <p>
                                            This tool is built and maintained by{' '}
                                            <a
                                                href="https://sdad.pro"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-accent hover:underline font-medium"
                                            >
                                                Sai Dutta Abhishek Dash
                                            </a>
                                            , the author of the open-source{' '}
                                            <a
                                                href="https://github.com/instax-dutta/MarkItDownJS"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-accent hover:underline font-medium"
                                            >
                                                MarkItDownJS
                                            </a>{' '}
                                            library.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.footer>
    );
}
