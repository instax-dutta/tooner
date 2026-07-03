import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import Header from './components/Header';
import Footer from './components/Footer';
import DropZone from './components/DropZone';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
import BatchProgress from './components/BatchProgress';
import BatchResults from './components/BatchResults';
import ErrorBoundary from './components/ErrorBoundary';
import useAppStore from './store/useAppStore';
import useSettingsStore from './store/useSettingsStore';
import { checkForSharedData } from './utils/share';
import { registry, registerBuiltinConverters } from './converters';

registerBuiltinConverters();

function App() {
  const store = useAppStore();
  const { state, file, progress, results, error,
    batchFiles, batchResults, batchIndex, batchProgress,
    setProcessing, setProgress, setDone, setError, cancel, reset,
    startBatch, setBatchProgress, addBatchResult, setBatchDone } = store;
  const { chunkOverlap, chunkSize } = useSettingsStore();

  // Check for shared .toon data in URL on mount
  useEffect(() => {
    checkForSharedData().then((toonFile) => {
      if (toonFile) {
        const orig = toonFile.original || {};
        const fakeFile = { name: orig.filename || 'shared.toon', size: orig.size || 0 };
        setProcessing(fakeFile);
        setDone({
          toonFile,
          stats: {
            originalTokens: orig.tokens || 0,
            optimizedTokens: toonFile.optimized?.tokens || 0,
            tokenReduction: 0,
            originalSize: orig.size || 0,
            compressedSize: 0,
            sizeReduction: 0,
            rawContent: '',
            isToonFormat: toonFile.optimized?.isToonFormat || false,
            chunks: toonFile.chunks || [],
          },
        });
      }
    });
  }, []);

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
    setProcessing(selectedFile);

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
        chunkOptions: { maxTokens: chunkSize, overlap: chunkOverlap },
      });

      setProgress(100);
      await new Promise((r) => setTimeout(r, 400));

      setDone({ toonFile, stats });
      try {
        const stored = localStorage.getItem('tooner_runs');
        localStorage.setItem('tooner_runs', String((stored ? parseInt(stored, 10) : 0) + 1));
      } catch {
        /* localStorage unavailable */
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message);
    }
  };

  const handleBatchSelect = async (files) => {
    const fileList = Array.from(files).slice(0, 20);
    startBatch(fileList);

    const { generateToonFile } = await import('./utils/tokenizer');

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      try {
        setBatchProgress(i, 0);
        const { content, format } = await registry.convert(f, (p) => {
          setBatchProgress(i, p * 60);
        });

        setBatchProgress(i, 70);
        const { toonFile, stats } = await generateToonFile({
          originalFilename: f.name,
          originalFormat: format,
          originalSize: f.size,
          rawContent: content,
          chunkOptions: { maxTokens: chunkSize, overlap: chunkOverlap },
        });

        setBatchProgress(i, 100);
        addBatchResult({ filename: f.name, toonFile, stats });
      } catch (err) {
        console.error(`Batch error on ${f.name}:`, err);
        addBatchResult({ filename: f.name, toonFile: null, stats: null, error: err.message });
      }
    }

    setBatchDone();
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen min-h-dvh relative">
        <Header />

        <main className="mt-[4.5rem] sm:mt-[5rem] h-[calc(100dvh-4.5rem)] sm:h-[calc(100dvh-5rem)] overflow-y-auto">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <DropZone
                key="dropzone"
                onFileSelect={handleFileSelect}
                onBatchSelect={handleBatchSelect}
                isProcessing={false}
              />
            )}

            {state === 'processing' && (
              <ProcessingView
                key="processing"
                file={file}
                progress={progress}
                onCancel={cancel}
              />
            )}

            {state === 'done' && results && (
              <ResultsView
                key="results"
                file={file}
                stats={results.stats}
                toonFile={results.toonFile}
                onReset={reset}
              />
            )}

            {state === 'batch-processing' && (
              <div key="batch-progress" className="flex flex-col items-center justify-center h-full px-4 py-4">
                <BatchProgress
                  files={batchFiles}
                  currentIndex={batchIndex}
                  currentProgress={batchProgress}
                />
              </div>
            )}

            {state === 'batch-done' && (
              <div key="batch-results" className="flex flex-col items-center justify-center h-full py-4">
                <BatchResults
                  results={batchResults.filter((r) => r.toonFile)}
                  onReset={reset}
                />
              </div>
            )}

            {state === 'error' && (
              <div key="error" className="flex flex-col items-center justify-center h-full px-4 sm:px-6 py-4">
                <div className="card max-w-sm sm:max-w-md w-full p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-3">
                    {error?.includes('File too large')
                      ? 'File too large'
                      : error?.includes('Unsupported')
                        ? 'Unsupported format'
                        : error?.includes('Failed to read')
                          ? 'Could not read file'
                          : error?.includes('No converter')
                            ? 'Format not supported'
                            : 'Something went wrong'}
                  </h2>
                  <p className="text-muted-foreground mb-4 text-xs leading-relaxed">{error}</p>
                  <div className="flex flex-col gap-1.5 items-center mb-5">
                    {error?.includes('File too large') && (
                      <p className="text-xs text-muted-foreground">Max file size is 100MB. Try a smaller file.</p>
                    )}
                    {error?.includes('No converter') && (
                      <p className="text-xs text-muted-foreground">This file format isn't supported yet.</p>
                    )}
                    {error?.includes('Failed to read') && (
                      <p className="text-xs text-muted-foreground">The file may be corrupted or protected.</p>
                    )}
                  </div>
                  <button
                    onClick={reset}
                    className="btn btn-primary w-full py-3 text-sm font-medium"
                  >
                    Try another file
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
