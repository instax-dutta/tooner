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
 * Tooner - Cyberpunk Document Tokenization
 */
function App() {
  const [state, setState] = useState('idle');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Lenis smooth scroll
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

  // GSAP page entrance
  useEffect(() => {
    gsap.fromTo(
      'body',
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setState('processing');
    setProgress(0);
    setError(null);

    try {
      const { content, format } = await processFile(selectedFile, (p) => {
        setProgress(p * 0.6);
      });

      setProgress(70);

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

      <main className="pt-14 sm:pt-16">
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
            <div key="error" className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-6">
              <div className="glass-card max-w-md w-full p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-[--error]/10 border border-[--error]/30 
                               flex items-center justify-center mx-auto mb-8
                               shadow-[0_0_40px_rgba(255,69,58,0.3)]">
                  <svg className="w-10 h-10 text-[--error]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[--text-primary] mb-4">
                  Processing Failed
                </h2>
                <p className="text-[--text-secondary] mb-8 text-sm leading-relaxed">{error}</p>
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
