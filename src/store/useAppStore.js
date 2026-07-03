import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  state: 'idle',
  file: null,
  progress: 0,
  results: null,
  error: null,

  // Batch state
  batchFiles: [],
  batchResults: [],
  batchIndex: 0,
  batchProgress: 0,

  setProcessing: (file) =>
    set({ state: 'processing', file, progress: 0, error: null }),

  setProgress: (progress) => set({ progress }),

  setDone: (results) => set({ state: 'done', results, progress: 100 }),

  setError: (error) => set({ state: 'error', error }),

  cancel: () =>
    set({ state: 'idle', file: null, progress: 0, error: null }),

  reset: () =>
    set({
      state: 'idle', file: null, progress: 0, results: null, error: null,
      batchFiles: [], batchResults: [], batchIndex: 0, batchProgress: 0,
    }),

  // Batch actions
  startBatch: (files) =>
    set({ state: 'batch-processing', batchFiles: files, batchResults: [], batchIndex: 0, batchProgress: 0 }),

  setBatchProgress: (index, progress) =>
    set({ batchIndex: index, batchProgress: progress }),

  addBatchResult: (result) =>
    set((s) => ({ batchResults: [...s.batchResults, result] })),

  setBatchDone: () =>
    set({ state: 'batch-done' }),
}));

export default useAppStore;
