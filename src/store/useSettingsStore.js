import { create } from 'zustand';

const useSettingsStore = create((set) => ({
  selectedModel: 'gpt-4o',
  setSelectedModel: (model) => set({ selectedModel: model }),

  chunkOverlap: 0,
  setChunkOverlap: (overlap) => set({ chunkOverlap: overlap }),

  chunkSize: 2000,
  setChunkSize: (size) => set({ chunkSize: size }),
}));

export default useSettingsStore;
