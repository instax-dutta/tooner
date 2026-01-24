import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import LenisProvider from './components/LenisProvider';
import Header from './components/Header';
import DropZone from './components/DropZone';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
import Settings from './components/Settings';
import { processFile } from './utils/fileProcessors';
import { generateToonFile } from './utils/tokenizer';

// App states
const STATES = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
};

function AppContent() {
  // State
  const [appState, setAppState] = useState(STATES.IDLE);
  const [currentFile, setCurrentFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    optimizationLevel: 'balanced',
    includeMetadata: true,
  });

  // Refs
  const processingCancelled = useRef(false);
  const mainRef = useRef(null);

  // GSAP page transition
  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [appState]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file) => {
    setCurrentFile(file);
    setAppState(STATES.PROCESSING);
    setProgress(0);
    setError(null);
    processingCancelled.current = false;

    try {
      const { content, format } = await processFile(file, (p) => {
        if (!processingCancelled.current) {
          setProgress(p * 0.6);
        }
      });

      if (processingCancelled.current) return;
      setProgress(70);

      const { toonFile, stats } = await generateToonFile({
        originalFilename: file.name,
        originalFormat: format,
        originalSize: file.size,
        rawContent: content,
        optimizationLevel: settings.optimizationLevel,
      });

      if (processingCancelled.current) return;
      setProgress(100);

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (processingCancelled.current) return;

      setResults({ toonFile, stats });
      setAppState(STATES.DONE);

    } catch (err) {
      if (!processingCancelled.current) {
        console.error('Processing error:', err);
        setError(err.message || 'An error occurred while processing the file');
        setAppState(STATES.ERROR);
      }
    }
  }, [settings.optimizationLevel]);

  const handleCancel = useCallback(() => {
    processingCancelled.current = true;
    setAppState(STATES.IDLE);
    setCurrentFile(null);
    setProgress(0);
  }, []);

  const handleReset = useCallback(() => {
    setAppState(STATES.IDLE);
    setCurrentFile(null);
    setProgress(0);
    setResults(null);
    setError(null);
  }, []);

  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
  }, []);

  return (
    <div className="min-h-screen bg-[--bg-primary] overflow-hidden">
      {/* Header */}
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      {/* Main Content */}
      <main ref={mainRef}>
        <AnimatePresence mode="wait">
          {appState === STATES.IDLE && (
            <DropZone
              key="dropzone"
              onFileSelect={handleFileSelect}
              isProcessing={false}
            />
          )}

          {appState === STATES.PROCESSING && currentFile && (
            <ProcessingView
              key="processing"
              file={currentFile}
              progress={progress}
              onCancel={handleCancel}
            />
          )}

          {appState === STATES.DONE && results && currentFile && (
            <ResultsView
              key="results"
              file={currentFile}
              stats={results.stats}
              toonFile={results.toonFile}
              onReset={handleReset}
            />
          )}

          {appState === STATES.ERROR && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] px-4"
            >
              <div className="card max-w-md text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  Processing Failed
                </h2>
                <p className="text-[--text-secondary] text-sm mb-6">
                  {error || 'An unexpected error occurred'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="btn btn-primary"
                >
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Panel */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}

function App() {
  return (
    <LenisProvider>
      <AppContent />
    </LenisProvider>
  );
}

export default App;
