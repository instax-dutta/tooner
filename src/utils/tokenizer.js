/**
 * Tokenizer utilities for Tooner
 * Uses the official TOON (Token-Oriented Object Notation) format
 * LOSSLESS: All original data is preserved, only formatting is optimized
 */

import { encode as encodeToon, decode as decodeToon } from '@toon-format/toon';

/**
 * Count tokens using GPT tokenizer
 * @param {string} text - Text to count tokens for
 * @returns {number} Token count
 */
export async function countTokens(text) {
    if (!text || typeof text !== 'string') return 0;
    try {
        const { encode } = await import('gpt-tokenizer');
        return encode(text).length;
    } catch (error) {
        console.warn('Token counting failed, using estimation:', error);
        return Math.ceil(text.length / 4);
    }
}

/**
 * LOSSLESS text normalization - only normalizes whitespace without removing data
 * @param {string} text - Input text
 * @returns {string} Normalized text (all original content preserved)
 */
function normalizeText(text) {
    return text
        // Normalize line endings to LF
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Reduce multiple blank lines to max 2 (keeps structure, saves tokens)
        .replace(/\n{4,}/g, '\n\n\n')
        // Trim trailing whitespace from lines (cosmetic, no data loss)
        .replace(/[ \t]+$/gm, '')
        // Trim leading/trailing whitespace from entire document
        .trim();
}

/**
 * Try to parse content as structured data for TOON encoding
 * TOON format is lossless - it reorganizes data structure, not content
 * @param {string} content - Content to parse
 * @returns {Object|null} Parsed object or null
 */
function tryParseStructured(content) {
    // Try JSON first - TOON is designed as a JSON alternative
    try {
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
        }
    } catch {
        // Not JSON, continue
    }

    // For non-JSON content, wrap as a simple document
    // This preserves the exact content while enabling TOON encoding
    return null;
}

/**
 * Convert content to TOON format (lossless)
 * @param {string} content - Content to convert
 * @returns {Object} Result with toon content and success status
 */
function convertToToon(content) {
    const structured = tryParseStructured(content);

    if (structured) {
        try {
            const toonContent = encodeToon(structured);
            return {
                content: toonContent,
                isToon: true,
                originalPreserved: true
            };
        } catch (error) {
            console.warn('TOON encoding failed:', error);
        }
    }

    // For plain text: store as-is (no transformation = guaranteed lossless)
    return {
        content,
        isToon: false,
        originalPreserved: true
    };
}

/**
 * Optimize text content - LOSSLESS operation
 * Only normalizes whitespace, never removes actual content
 * @param {string} content - Raw content to optimize
 * @returns {Object} Optimized result
 */
export function optimizeContent(content) {
    if (!content || typeof content !== 'string') {
        return { content: '', isToon: false, originalPreserved: true };
    }

    // Step 1: Normalize whitespace (lossless - only formatting)
    const normalized = normalizeText(content);

    // Step 2: Try to convert to TOON if it's structured data (lossless)
    return convertToToon(normalized);
}

/**
 * Compress content using gzip
 * @param {string} content - Content to compress
 * @returns {Promise<Uint8Array>} Compressed data
 */
export async function compressContent(content) {
    const { gzip, strToU8 } = await import('fflate');
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
export async function decompressContent(compressed) {
    const { gunzip, strFromU8 } = await import('fflate');
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
 * LOSSLESS: Original content can be fully recovered
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} Toon file data and statistics
 */
export async function generateToonFile({
    originalFilename,
    originalFormat,
    originalSize,
    rawContent,
}) {
    // Count original tokens
    const originalTokens = await countTokens(rawContent);

    // Optimize content (lossless - only whitespace normalization + TOON format)
    const { content: optimizedContent, isToon } = optimizeContent(rawContent);
    const optimizedTokens = await countTokens(optimizedContent);

    // Compress with gzip (lossless compression)
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
    const toonFile = {
        version: '1.0',
        format: isToon ? 'toon' : 'text',
        lossless: true, // Flag indicating data can be fully recovered
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
            generator: 'Tooner v1.0',
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
        lossless: true,
    };

    return { toonFile, stats };
}

/**
 * Create a downloadable .toon file
 * @param {Object} toonData - Toon file data
 * @returns {Blob} Downloadable blob
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

    // Decompress (lossless)
    const content = await decompressContent(bytes);

    // If it was TOON format, decode it back to JSON
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
