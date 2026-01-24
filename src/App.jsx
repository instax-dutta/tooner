import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Lenis from 'lenis';
import Header from './components/Header';
import DropZone from './components/DropZone';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
import { processFile } from './utils/fileProcessors';
import { generateToonFile } from './utils/tokenizer';

/**
 * Tooner - Privacy-focused document tokenization
 * LOSSLESS: All processing preserves original content
 */
function App() {
  const [state, setState] = useState('idle'); // idle | processing | done | error
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
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

  // GSAP page transition
  useEffect(() => {
    gsap.fromTo(
      'body',
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  }, []);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setState('processing');
    setProgress(0);
    setError(null);

    try {
      // Process file to extract text
      const { content, format } = await processFile(selectedFile, (p) => {
        setProgress(p * 0.6); // 0-60% for extraction
      });

      setProgress(70);

      // Generate .toon file (LOSSLESS)
      const { toonFile, stats } = await generateToonFile({
        originalFilename: selectedFile.name,
        originalFormat: format,
        originalSize: selectedFile.size,
        rawContent: content,
      });

      setProgress(100);

      // Small delay for animation
      await new Promise((r) => setTimeout(r, 300));

      setResults({ toonFile, stats });
      setState('done');
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
    <div className="min-h-screen min-h-dvh bg-[--bg-primary] relative overflow-hidden">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] 
                        bg-[radial-gradient(circle,_var(--accent-glow)_0%,_transparent_60%)] 
                        opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] 
                        bg-[radial-gradient(circle,_rgba(34,197,94,0.15)_0%,_transparent_60%)] 
                        opacity-20 blur-3xl" />
      </div>

      {/* Header - simplified, no settings */}
      <Header />

      {/* Main content with proper spacing from header */}
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
            <div
              key="error"
              className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-6"
            >
              <div className="card max-w-md w-full p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[--error]/10 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[--error]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-[--text-primary] mb-3">
                  Processing Failed
                </h2>
                <p className="text-[--text-secondary] mb-6 text-sm leading-relaxed">{error}</p>
                <button onClick={handleReset} className="btn btn-primary w-full">
                  Try Again
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
