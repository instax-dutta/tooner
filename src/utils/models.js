/**
 * LLM model definitions for token counting and cost estimation.
 * Tokenizer variant determines which tokenizer to use for accurate counts.
 */

export const MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    maxTokens: 128000,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
    tokenizer: 'cl100k_base',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    maxTokens: 8192,
    costPer1kInput: 0.03,
    costPer1kOutput: 0.06,
    tokenizer: 'cl100k_base',
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    maxTokens: 200000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    tokenizer: 'cl100k_base',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    maxTokens: 2000000,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.005,
    tokenizer: 'cl100k_base',
  },
];

export const DEFAULT_MODEL = 'gpt-4o';

/**
 * Get model by ID
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getModel(id) {
  return MODELS.find((m) => m.id === id);
}

/**
 * Estimate cost for processing a document
 * @param {number} tokens - Token count
 * @param {string} modelId
 * @returns {{ inputCost: number, formatted: string }}
 */
export function estimateCost(tokens, modelId) {
  const model = getModel(modelId) || getModel(DEFAULT_MODEL);
  const inputCost = (tokens / 1000) * model.costPer1kInput;
  return {
    inputCost,
    formatted: `$${inputCost.toFixed(2)}`,
  };
}
