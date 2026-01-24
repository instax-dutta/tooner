/**
 * Tokenizer utilities for Tooner
 * Uses the official TOON (Token-Oriented Object Notation) format
 * for maximum token efficiency when feeding data to LLMs
 */

import { encode as encodeToon, decode as decodeToon } from '@toon-format/toon';
import { encode as gptEncode } from 'gpt-tokenizer';
import { gzip, gunzip, strToU8, strFromU8 } from 'fflate';

/**
 * Count tokens using GPT tokenizer
 * @param {string} text - Text to count tokens for
 * @returns {number} Token count
 */
export function countTokens(text) {
    if (!text || typeof text !== 'string') return 0;
    try {
        return gptEncode(text).length;
    } catch (error) {
        console.warn('Token counting failed, using estimation:', error);
        // Fallback: rough estimation (1 token ≈ 4 characters)
        return Math.ceil(text.length / 4);
    }
}

/**
 * Optimization settings
 */
export const OPTIMIZATION_LEVELS = {
    minimal: {
        name: 'Minimal',
        description: 'Preserve formatting, light cleanup',
        settings: {
            removeExcessWhitespace: true,
            normalizeLineEndings: true,
            useToonFormat: false, // Keep as plain text
            deduplicate: false,
            stripMetadata: false,
        },
    },
    balanced: {
        name: 'Balanced',
        description: 'Smart TOON optimization',
        settings: {
            removeExcessWhitespace: true,
            normalizeLineEndings: true,
            useToonFormat: true, // Convert to TOON
            deduplicate: true,
            stripMetadata: false,
        },
    },
    aggressive: {
        name: 'Aggressive',
        description: 'Maximum token reduction',
        settings: {
            removeExcessWhitespace: true,
            normalizeLineEndings: true,
            useToonFormat: true, // Convert to TOON
            deduplicate: true,
            stripMetadata: true,
        },
    },
};

/**
 * Remove excessive whitespace while preserving structure
 * @param {string} text - Input text
 * @returns {string} Cleaned text
 */
function removeExcessWhitespace(text) {
    return text
        .replace(/ {2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+$/gm, '')
        .replace(/^[ \t]+/gm, (match) => {
            return match.length > 4 ? '    ' : match;
        });
}

/**
 * Normalize line endings to LF
 * @param {string} text - Input text
 * @returns {string} Normalized text
 */
function normalizeLineEndings(text) {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Find and remove duplicate lines
 * @param {string} text - Input text
 * @returns {string} Text with deduplicated sections
 */
function deduplicate(text) {
    const lines = text.split('\n');
    const seen = new Map();
    const result = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.length < 30) {
            result.push(line);
            continue;
        }

        if (seen.has(trimmed)) {
            continue;
        }

        seen.set(trimmed, true);
        result.push(line);
    }

    return result.join('\n');
}

/**
 * Strip metadata and formatting artifacts
 * @param {string} text - Input text
 * @returns {string} Cleaned text
 */
function stripMetadata(text) {
    return text
        .replace(/^(Author|Date|Title|Subject|Keywords|Creator|Producer):.*$/gim, '')
        .replace(/^Page \d+ of \d+$/gim, '')
        .replace(/^\d{1,2}\/\d{1,2}\/\d{2,4}(?: \d{1,2}:\d{2}(:\d{2})?(?: ?[AP]M)?)?$/gim, '');
}

/**
 * Try to parse content as structured data for TOON encoding
 * @param {string} content - Content to parse
 * @returns {Object|null} Parsed object or null
 */
function tryParseStructured(content) {
    // Try JSON
    try {
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
        }
    } catch {
        // Not JSON
    }

    // Try to structure as document with sections
    const lines = content.split('\n');
    if (lines.length > 5) {
        // Structure plain text as a document object
        const sections = [];
        let currentSection = { title: 'Content', text: '' };

        for (const line of lines) {
            // Detect headers (lines that look like titles)
            if (line.match(/^#+\s/) || line.match(/^[A-Z][A-Za-z\s]{2,}:?\s*$/) && line.length < 80) {
                if (currentSection.text.trim()) {
                    sections.push({ ...currentSection });
                }
                currentSection = { title: line.replace(/^#+\s*/, '').trim(), text: '' };
            } else {
                currentSection.text += line + '\n';
            }
        }

        if (currentSection.text.trim()) {
            sections.push(currentSection);
        }

        if (sections.length > 1) {
            return { document: { sections } };
        }
    }

    return null;
}

/**
 * Convert content to TOON format if possible
 * @param {string} content - Content to convert
 * @returns {Object} Result with toon content and success status
 */
function convertToToon(content) {
    const structured = tryParseStructured(content);

    if (structured) {
        try {
            const toonContent = encodeToon(structured);
            return { content: toonContent, isToon: true, structured };
        } catch (error) {
            console.warn('TOON encoding failed:', error);
        }
    }

    // Fallback: wrap as simple text document
    try {
        const simpleDoc = { content: content.trim() };
        const toonContent = encodeToon(simpleDoc);
        return { content: toonContent, isToon: true, structured: simpleDoc };
    } catch {
        // Final fallback: return as plain text
        return { content, isToon: false, structured: null };
    }
}

/**
 * Optimize text content based on settings
 * @param {string} content - Raw content to optimize
 * @param {string} level - Optimization level
 * @returns {Object} Optimized result
 */
export function optimizeContent(content, level = 'balanced') {
    if (!content || typeof content !== 'string') {
        return { content: '', isToon: false };
    }

    const { settings } = OPTIMIZATION_LEVELS[level] || OPTIMIZATION_LEVELS.balanced;
    let optimized = content;

    if (settings.normalizeLineEndings) {
        optimized = normalizeLineEndings(optimized);
    }

    if (settings.removeExcessWhitespace) {
        optimized = removeExcessWhitespace(optimized);
    }

    if (settings.stripMetadata) {
        optimized = stripMetadata(optimized);
    }

    if (settings.deduplicate) {
        optimized = deduplicate(optimized);
    }

    optimized = optimized.trim();

    // Convert to TOON format if enabled
    if (settings.useToonFormat) {
        return convertToToon(optimized);
    }

    return { content: optimized, isToon: false };
}

/**
 * Compress content using gzip
 * @param {string} content - Content to compress
 * @returns {Promise<Uint8Array>} Compressed data
 */
export function compressContent(content) {
    return new Promise((resolve, reject) => {
        try {
            const data = strToU8(content);
            gzip(data, { level: 9 }, (err, compressed) => {
                if (err) reject(err);
                else resolve(compressed);
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Decompress gzip content
 * @param {Uint8Array} compressed - Compressed data
 * @returns {Promise<string>} Decompressed content
 */
export function decompressContent(compressed) {
    return new Promise((resolve, reject) => {
        gunzip(compressed, (err, decompressed) => {
            if (err) reject(err);
            else resolve(strFromU8(decompressed));
        });
    });
}

/**
 * Convert Uint8Array to base64 string
 * @param {Uint8Array} bytes - Byte array
 * @returns {string} Base64 string
 */
function uint8ToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Generate a .toon file from content
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} Toon file data and statistics
 */
export async function generateToonFile({
    originalFilename,
    originalFormat,
    originalSize,
    rawContent,
    optimizationLevel = 'balanced',
}) {
    // Count original tokens
    const originalTokens = countTokens(rawContent);

    // Optimize content (may convert to TOON format)
    const { content: optimizedContent, isToon } = optimizeContent(rawContent, optimizationLevel);
    const optimizedTokens = countTokens(optimizedContent);

    // Compress
    const compressed = await compressContent(optimizedContent);
    const compressedBase64 = uint8ToBase64(compressed);

    // Calculate reduction
    const tokenReduction = originalTokens > 0
        ? Math.round(((originalTokens - optimizedTokens) / originalTokens) * 100)
        : 0;

    const sizeReduction = originalSize > 0
        ? Math.round(((originalSize - compressed.length) / originalSize) * 100)
        : 0;

    // Create .toon file structure
    // This wraps the TOON-formatted content in a metadata envelope
    const toonFile = {
        version: '1.0',
        format: isToon ? 'toon' : 'text', // Indicate if TOON format was used
        original: {
            filename: originalFilename,
            type: originalFormat,
            size: originalSize,
            tokens: originalTokens,
        },
        optimized: {
            content: compressedBase64,
            encoding: 'utf-8',
            compression: 'gzip',
            tokens: optimizedTokens,
            reduction: `${tokenReduction}%`,
            isToonFormat: isToon,
        },
        metadata: {
            created: new Date().toISOString(),
            generator: 'Tooner',
            settings: {
                optimizationLevel,
            },
        },
    };

    // Statistics for display
    const stats = {
        originalTokens,
        optimizedTokens,
        tokenReduction,
        originalSize,
        compressedSize: compressed.length,
        sizeReduction,
        rawContent: optimizedContent, // For copy-to-clipboard
        isToonFormat: isToon,
    };

    return { toonFile, stats };
}

/**
 * Create a downloadable .toon file
 * @param {Object} toonData - Toon file data
 * @returns {Blob} Downloadable blob
 */
export function createToonBlob(toonData) {
    const json = JSON.stringify(toonData, null, 2);
    return new Blob([json], { type: 'application/json' });
}

/**
 * Generate download filename from original
 * @param {string} originalFilename - Original filename
 * @returns {string} New filename with .toon extension
 */
export function getToonFilename(originalFilename) {
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    return `${baseName}.toon`;
}

/**
 * Format byte size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format token count for display
 * @param {number} tokens - Token count
 * @returns {string} Formatted token string
 */
export function formatTokens(tokens) {
    if (tokens < 1000) return tokens.toString();
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
    return `${(tokens / 1000000).toFixed(2)}M`;
}

/**
 * Decode a .toon file back to original content
 * @param {Object} toonFile - The .toon file object
 * @returns {Promise<string>} Decoded content
 */
export async function decodeToonFile(toonFile) {
    if (!toonFile?.optimized?.content) {
        throw new Error('Invalid .toon file format');
    }

    // Decode base64
    const binary = atob(toonFile.optimized.content);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    // Decompress
    const content = await decompressContent(bytes);

    // If it was TOON format, decode it
    if (toonFile.optimized.isToonFormat) {
        try {
            const decoded = decodeToon(content);
            return JSON.stringify(decoded, null, 2);
        } catch {
            return content;
        }
    }

    return content;
}
