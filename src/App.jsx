import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import Header from './components/Header';
import DropZone from './components/DropZone';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
import { registry, registerBuiltinConverters } from './converters';

registerBuiltinConverters();

function App() {
    const [state, setState] = useState('idle');
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => lenis.destroy();
    }, []);

    const handleFileSelect = async (selectedFile) => {
        setFile(selectedFile);
        setState('processing');
        setProgress(0);
        setError(null);

        try {
            const { content, format } = await registry.convert(selectedFile, (p) => {
                setProgress(p * 0.6);
            });

            setProgress(70);

            const { generateToonFile } = await import('./utils/tokenizer');
            const { toonFile, stats } = await generateToonFile({
                originalFilename: selectedFile.name,
                originalFormat: format,
                originalSize: selectedFile.size,
                rawContent: content,
            });

            setProgress(100);
            await new Promise((r) => setTimeout(r, 400));

            setResults({ toonFile, stats });
            setState('done');
            try {
                const stored = localStorage.getItem('tooner_runs');
                localStorage.setItem('tooner_runs', String((stored ? parseInt(stored, 10) : 0) + 1));
            } catch { /* localStorage unavailable */ }
        } catch (err) {
            console.error('Processing error:', err);
            setError(err.message);
            setState('error');
        }
    };

    const handleCancel = () => {
        setState('idle');
        setFile(null);
        setProgress(0);
        setError(null);
    };

    const handleReset = () => {
        setState('idle');
        setFile(null);
        setProgress(0);
        setResults(null);
        setError(null);
    };

    return (
        <div className="min-h-screen min-h-dvh relative overflow-hidden">
            <Header />

            <main className="pt-20 sm:pt-24">
                <AnimatePresence mode="wait">
                    {state === 'idle' && (
                        <DropZone
                            key="dropzone"
                            onFileSelect={handleFileSelect}
                            isProcessing={false}
                        />
                    )}

                    {state === 'processing' && (
                        <ProcessingView
                            key="processing"
                            file={file}
                            progress={progress}
                            onCancel={handleCancel}
                        />
                    )}

                    {state === 'done' && results && (
                        <ResultsView
                            key="results"
                            file={file}
                            stats={results.stats}
                            toonFile={results.toonFile}
                            onReset={handleReset}
                        />
                    )}

                    {state === 'error' && (
                        <div key="error" className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-20 sm:py-24">
                            <div className="card max-w-sm sm:max-w-md w-full p-8 sm:p-10 text-center">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-destructive/10 border border-destructive/20
                                    flex items-center justify-center mx-auto mb-8">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-4">
                                    {error?.includes('File too large') ? 'File too large' :
                                     error?.includes('Unsupported') ? 'Unsupported format' :
                                     error?.includes('Failed to read') ? 'Could not read file' :
                                     error?.includes('No converter') ? 'Format not supported' :
                                     'Something went wrong'}
                                </h2>
                                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{error}</p>
                                <div className="flex flex-col gap-2 items-center mb-8">
                                    {error?.includes('File too large') && (
                                        <p className="text-[11px] text-muted-foreground">Max file size is 100MB. Try a smaller file.</p>
                                    )}
                                    {error?.includes('No converter') && (
                                        <p className="text-[11px] text-muted-foreground">This file format isn't supported yet.</p>
                                    )}
                                    {error?.includes('Failed to read') && (
                                        <p className="text-[11px] text-muted-foreground">The file may be corrupted or protected.</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="btn btn-primary w-full py-3.5 text-sm font-medium"
                                >
                                    Try another file
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default App;
