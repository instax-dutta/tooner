import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODELS } from '../utils/models';
import useSettingsStore from '../store/useSettingsStore';

export default function ModelSelector() {
  const { selectedModel, setSelectedModel } = useSettingsStore();
  const [open, setOpen] = useState(false);

  const current = MODELS.find((m) => m.id === selectedModel) || MODELS[0];

  return (
    <div className="relative w-full max-w-sm sm:max-w-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-card border border-border rounded-lg text-xs cursor-pointer hover:border-accent/40 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <span className="font-medium text-foreground truncate">{current.name}</span>
          <span className="text-muted-foreground">· {current.provider}</span>
        </div>
        <svg className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg overflow-hidden shadow-lg"
          >
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => { setSelectedModel(model.id); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs cursor-pointer transition-colors
                  ${model.id === selectedModel ? 'bg-accent/10 text-accent' : 'hover:bg-muted text-foreground'}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium truncate">{model.name}</span>
                  <span className="text-muted-foreground">{model.provider}</span>
                </div>
                <span className="text-muted-foreground font-mono text-[10px]">
                  {model.costPer1kInput < 0.01 ? `$${model.costPer1kInput}/1K` : `$${model.costPer1kInput}/1K`}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
