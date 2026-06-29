/**
 * Tokenizer utilities for Tooner
 * Uses the official TOON (Token-Oriented Object Notation) format
 * Semantic optimization: content is restructured and reduced while preserving meaning
 */

import { encode as encodeToon, decode as decodeToon } from '@toon-format/toon';

// ---------------------------------------------------------------------------
// Format classification
// ---------------------------------------------------------------------------

const CODE_EXTENSIONS = new Set([
    'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp',
    'cs', 'go', 'rs', 'rb', 'php', 'swift', 'kt',
]);

/**
 * Determine if a format produces or uses Markdown layout
 * PDF, DOCX, PPTX, HTML, EPUB are all converted to Markdown by MarkItDownJS.
 * @param {string} format
 * @returns {boolean}
 */
function isMarkdownFormat(format) {
    const fmt = (format || '').toLowerCase().replace(/^\./, '');
    return ['md', 'markdown', 'mdx', 'pdf', 'docx', 'pptx', 'epub', 'rtf', 'html', 'htm'].includes(fmt);
}

// ---------------------------------------------------------------------------
// Token counting
// ---------------------------------------------------------------------------

/**
 * Count tokens using GPT tokenizer
 * @param {string} text - Text to count tokens for
 * @returns {Promise<number>} Token count
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

// ---------------------------------------------------------------------------
// Shared text normalization (fallback for unknown formats)
// ---------------------------------------------------------------------------

/**
 * Normalize whitespace — baseline transformation for unknown formats
 * @param {string} text - Input text
 * @returns {string} Normalized text
 */
function normalizeText(text) {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/[ \t]+$/gm, '')
        .trim();
}

// ---------------------------------------------------------------------------
// Markdown optimizer
// ---------------------------------------------------------------------------

/**
 * Semantically optimize Markdown content
 * Removes decorative elements, normalizes formatting, strips badges & empty links
 * @param {string} text - Raw Markdown
 * @returns {string} Optimized Markdown
 */
function optimizeMarkdown(text) {
    let out = text;

    // Normalize line endings
    out = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove HTML comments (single-line and multi-line)
    out = out.replace(/<!--[\s\S]*?-->/g, '');

    // Remove badge/shield images (shields.io and GitHub Actions badge SVGs)
    out = out.replace(/^!\[.*?\]\(https?:\/\/img\.shields\.io\/[^)]*\)[ \t]*$/gm, '');
    out = out.replace(/^!\[.*?\]\(https?:\/\/github\.com\/[^)]*actions\/workflows\/[^)]*badge\.svg[^)]*\)[ \t]*$/gm, '');

    // Convert Setext headings to ATX
    // H1: line followed by line of ====+
    out = out.replace(/^(.+)\n={3,}[ \t]*$/gm, '# $1');
    // H2: line followed by line of ----+
    out = out.replace(/^(.+)\n-{3,}[ \t]*$/gm, '## $1');

    // Normalize horizontal rules (*, -, _ with optional spaces, 3+ chars)
    out = out.replace(/^[ \t]*([-*_][ \t]*){3,}$/gm, '---');

    // Strip decorative HTML tags: <br>, <br/>, <br />, <hr>, <hr/>, <hr />
    out = out.replace(/<br\s*\/?>/gi, '');
    out = out.replace(/<hr\s*\/?>/gi, '');

    // Simplify self-referencing links: [url](url) → url
    out = out.replace(/\[(https?:\/\/[^\]]+)\]\(\1\)/g, '$1');

    // Remove empty links: [](url)
    out = out.replace(/\[\]\([^)]*\)/g, '');

    // Collapse multiple consecutive spaces not at the start of a line (retains list indentation)
    out = out.replace(/(?<!^)[ \t]{2,}/gm, ' ');

    // Normalize space after bullets or lists
    out = out.replace(/^([ \t]*[-*+])[ \t]{2,}/gm, '$1 ');
    out = out.replace(/^([ \t]*\d+\.)[ \t]{2,}/gm, '$1 ');

    // Remove spacing inside bold/italic tags
    out = out.replace(/\*\* +/g, '**').replace(/ +\*\*/g, '**');
    out = out.replace(/\* +/g, '*').replace(/ +\*/g, '*');
    out = out.replace(/_ +/g, '_').replace(/ +_/g, '_');

    // Remove empty markdown headers
    out = out.replace(/^#{1,6}[ \t]*$/gm, '');

    // Collapse 2+ consecutive blank lines to 1 blank line
    out = out.replace(/\n{3,}/g, '\n\n');

    // Remove trailing whitespace from all lines
    out = out.replace(/[ \t]+$/gm, '');

    return out.trim();
}

// ---------------------------------------------------------------------------
// Code optimizer
// ---------------------------------------------------------------------------

/** Pragma/annotation patterns to preserve in single-line comments */
const PRAGMA_PATTERN = /eslint-disable|eslint-enable|@ts-ignore|@ts-expect-error|@ts-nocheck|@ts-check|@type|@param|@returns|@typedef|@template|@override|@deprecated|@see|@todo|@fixme|@hack|noqa|noinspection|pragma|sourceMappingURL|istanbul|c8/i;

/**
 * Semantically optimize source code
 * Removes non-essential comments, normalizes whitespace and indentation
 * Preserves JSDoc, docstrings, pragmas, and annotations
 * @param {string} text - Source code
 * @returns {string} Optimized code
 */
function optimizeCode(text) {
    let out = text;

    // Normalize line endings
    out = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove block comments (/* ... */) but KEEP JSDoc (/** ... */)
    // Match /* that is NOT followed by * (which would be /**)
    out = out.replace(/\/\*(?!\*)[\s\S]*?\*\//g, '');

    // Remove single-line comments on their own line (not inline, not pragmas)
    // Matches lines that are only a // comment (with optional leading whitespace)
    out = out.replace(/^[ \t]*\/\/(?!.*(?:eslint-disable|eslint-enable|@ts-ignore|@ts-expect-error|@ts-nocheck|@ts-check|@type|@param|@returns|@typedef|@template|@override|@deprecated|@see|@todo|@fixme|@hack|noqa|noinspection|pragma|sourceMappingURL|istanbul|c8)).*$/gim, '');

    // Remove Python/Ruby single-line comments on their own line (# comments), skip shebangs and pragmas
    out = out.replace(/^[ \t]*#(?!!\/|.*(?:noqa|type:|pragma|pylint|flake8|isort|mypy|noinspection|coding|encoding|frozen_string_literal)).*$/gm, '');

    // Collapse 3+ consecutive blank lines to 1
    out = out.replace(/\n{4,}/g, '\n\n');

    // Trim trailing whitespace from all lines
    out = out.replace(/[ \t]+$/gm, '');

    // Normalize indentation: convert tabs to 2 spaces
    out = out.replace(/\t/g, '  ');

    return out.trim();
}

// ---------------------------------------------------------------------------
// JSON optimizer
// ---------------------------------------------------------------------------

/**
 * Recursively remove keys with null values from an object
 * @param {*} obj - Value to clean
 * @returns {*} Cleaned value
 */
function removeNulls(obj) {
    if (Array.isArray(obj)) {
        return obj.map(removeNulls);
    }
    if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== null) {
                cleaned[key] = removeNulls(value);
            }
        }
        return cleaned;
    }
    return obj;
}

/**
 * Semantically optimize JSON content
 * Attempts TOON encoding, falls back to minification. Removes null-valued keys.
 * @param {string} text - JSON text
 * @returns {{ content: string, isToon: boolean }} Optimized result
 */
function optimizeJson(text) {
    // Try to parse as JSON
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        // Not valid JSON — just normalize whitespace
        return { content: normalizeText(text), isToon: false };
    }

    // Remove null-valued keys recursively
    const cleaned = removeNulls(parsed);

    // Try TOON encoding
    try {
        const toonContent = encodeToon(cleaned);
        return { content: toonContent, isToon: true };
    } catch (error) {
        console.warn('TOON encoding failed, falling back to minified JSON:', error);
    }

    // Fallback: minified JSON
    return { content: JSON.stringify(cleaned), isToon: false };
}

// ---------------------------------------------------------------------------
// XML optimizer
// ---------------------------------------------------------------------------

/**
 * Semantically optimize XML content
 * Removes comments, processing instructions, and collapses inter-tag whitespace
 * @param {string} text - XML text
 * @returns {string} Optimized XML
 */
function optimizeXml(text) {
    let out = text;

    // Normalize line endings
    out = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove XML comments
    out = out.replace(/<!--[\s\S]*?-->/g, '');

    // Remove processing instructions (<?...?>)
    out = out.replace(/<\?[\s\S]*?\?>/g, '');

    // Collapse whitespace between tags: >  whitespace  < → ><
    out = out.replace(/>\s+</g, '><');

    // Remove empty text nodes (lines that are only whitespace between tags)
    out = out.replace(/^\s+$/gm, '');

    // Collapse multiple blank lines
    out = out.replace(/\n{3,}/g, '\n\n');

    return out.trim();
}

// ---------------------------------------------------------------------------
// Data (CSV / tabular) optimizer
// ---------------------------------------------------------------------------

/**
 * Semantically optimize CSV / tabular data
 * Removes empty rows, trims cell whitespace
 * @param {string} text - CSV or tabular text
 * @returns {string} Optimized data
 */
function optimizeData(text) {
    // Normalize line endings
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const lines = normalized.split('\n');
    const result = [];

    for (const line of lines) {
        // Split by common delimiters (comma, tab, pipe) to trim cells
        // Detect delimiter
        const delimiter = line.includes('\t') ? '\t' : line.includes('|') ? '|' : ',';
        const cells = line.split(delimiter).map((cell) => cell.trim());

        // Skip rows where all values are empty
        const allEmpty = cells.every((cell) => cell === '');
        if (allEmpty) continue;

        result.push(cells.join(delimiter));
    }

    return result.join('\n').trim();
}

// ---------------------------------------------------------------------------
// HTML optimizer
// ---------------------------------------------------------------------------

/**
 * Semantically optimize HTML content
 * Strips scripts, styles, tags — extracts plain text content
 * @param {string} text - HTML text
 * @returns {string} Plain text content
 */
function optimizeHtml(text) {
    let out = text;

    // Normalize line endings
    out = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove HTML comments
    out = out.replace(/<!--[\s\S]*?-->/g, '');

    // Remove <script> blocks entirely
    out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

    // Remove <style> blocks entirely
    out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

    // Strip all HTML tags, keeping only text content
    out = out.replace(/<[^>]+>/g, ' ');

    // Collapse runs of whitespace to a single space
    out = out.replace(/[ \t]+/g, ' ');

    // Collapse multiple blank lines
    out = out.replace(/\n[ \n]+\n/g, '\n\n');

    // Trim lines
    out = out.replace(/^ +| +$/gm, '');

    return out.trim();
}

// ---------------------------------------------------------------------------
// Top-level content optimizer — routes by format
// ---------------------------------------------------------------------------

/**
 * Semantically optimize content based on file format
 * Routes to the appropriate format-specific optimizer
 * @param {string} content - Raw file content
 * @param {string} [format] - File extension / format (e.g. 'md', 'json', 'py')
 * @returns {{ content: string, isToon: boolean }} Optimized result
 */
export function optimizeContent(content, format) {
    if (!content || typeof content !== 'string') {
        return { content: '', isToon: false };
    }

    const fmt = (format || '').toLowerCase().replace(/^\./, '');

    // Markdown & Document layouts converted to Markdown by MarkItDown
    if (isMarkdownFormat(fmt)) {
        return { content: optimizeMarkdown(content), isToon: false };
    }

    // JSON
    if (fmt === 'json' || fmt === 'jsonl' || fmt === 'jsonc') {
        return optimizeJson(content);
    }

    // XML
    if (fmt === 'xml' || fmt === 'svg' || fmt === 'xsl' || fmt === 'xslt') {
        return { content: optimizeXml(content), isToon: false };
    }

    // CSV / tabular data
    if (fmt === 'csv' || fmt === 'tsv' || fmt === 'xlsx' || fmt === 'xls') {
        return { content: optimizeData(content), isToon: false };
    }

    // Code files
    if (CODE_EXTENSIONS.has(fmt)) {
        return { content: optimizeCode(content), isToon: false };
    }

    // HTML
    if (fmt === 'html' || fmt === 'htm') {
        return { content: optimizeHtml(content), isToon: false };
    }

    // Fallback: normalize whitespace only
    return { content: normalizeText(content), isToon: false };
}

// ---------------------------------------------------------------------------
// Compression utilities
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Chunking engine
// ---------------------------------------------------------------------------

/** Maximum tokens per chunk before splitting on paragraph boundaries */
const MAX_CHUNK_TOKENS = 2000;

/**
 * Estimate token count synchronously (for chunking — avoids async overhead per chunk)
 * Uses ~4 chars per token heuristic; real counts are computed after chunking.
 * @param {string} text
 * @returns {number}
 */
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

/**
 * Split a single section into sub-chunks on paragraph boundaries if it exceeds
 * the token limit. Returns an array of text blocks.
 * @param {string} text
 * @returns {string[]}
 */
function splitLargeSection(text) {
    if (estimateTokens(text) <= MAX_CHUNK_TOKENS) {
        return [text];
    }

    // Split on double-newline (paragraph boundary)
    const paragraphs = text.split(/\n\n+/);
    const pieces = [];
    let buffer = '';

    for (const para of paragraphs) {
        const combined = buffer ? buffer + '\n\n' + para : para;
        if (estimateTokens(combined) > MAX_CHUNK_TOKENS && buffer) {
            pieces.push(buffer.trim());
            buffer = para;
        } else {
            buffer = combined;
        }
    }
    if (buffer.trim()) {
        pieces.push(buffer.trim());
    }

    return pieces;
}

/**
 * Create content chunks for the .toon file structure.
 * For markdown, splits on heading boundaries (lines starting with #).
 * For other formats, splits on double-newlines.
 * @param {string} content - Optimized content
 * @param {string} format - File format
 * @returns {Promise<Array<{ index: number, content: string, tokens: number, heading: string|null }>>}
 */
async function createChunks(content, format) {
    const isMarkdown = isMarkdownFormat(format);

    /** @type {{ heading: string|null, body: string }[]} */
    const rawSections = [];

    if (isMarkdown) {
        // Split on heading lines (# ...)
        const lines = content.split('\n');
        let currentHeading = null;
        let currentBody = [];

        for (const line of lines) {
            const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
            if (headingMatch) {
                // Flush previous section
                if (currentBody.length > 0 || currentHeading !== null) {
                    rawSections.push({
                        heading: currentHeading,
                        body: currentBody.join('\n').trim(),
                    });
                }
                currentHeading = headingMatch[2].trim();
                currentBody = [];
            } else {
                currentBody.push(line);
            }
        }
        // Flush last section
        if (currentBody.length > 0 || currentHeading !== null) {
            rawSections.push({
                heading: currentHeading,
                body: currentBody.join('\n').trim(),
            });
        }
    } else {
        // Non-markdown: split on double-newlines
        const blocks = content.split(/\n\n+/);
        for (const block of blocks) {
            const trimmed = block.trim();
            if (trimmed) {
                rawSections.push({ heading: null, body: trimmed });
            }
        }
    }

    // Explode large sections and build final chunk list
    const chunks = [];
    let index = 0;

    for (const section of rawSections) {
        if (!section.body && !section.heading) continue;

        const textToChunk = section.heading
            ? (section.body ? `# ${section.heading}\n\n${section.body}` : `# ${section.heading}`)
            : section.body;

        const subPieces = splitLargeSection(textToChunk);

        for (let i = 0; i < subPieces.length; i++) {
            const piece = subPieces[i];
            const tokens = await countTokens(piece);
            chunks.push({
                index,
                content: piece,
                tokens,
                heading: i === 0 ? (section.heading || null) : null,
            });
            index++;
        }
    }

    // Edge case: if content is empty or only whitespace, return a single empty chunk
    if (chunks.length === 0 && content.trim()) {
        const tokens = await countTokens(content);
        chunks.push({ index: 0, content: content.trim(), tokens, heading: null });
    }

    return chunks;
}

// ---------------------------------------------------------------------------
// .toon file generation
// ---------------------------------------------------------------------------

/**
 * Generate a .toon file from content
 * Semantically optimizes content and creates chunked output
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

    // Semantically optimize content based on format
    const { content: optimizedContent, isToon } = optimizeContent(rawContent, originalFormat);
    const optimizedTokens = await countTokens(optimizedContent);

    // Generate content chunks
    const chunks = await createChunks(optimizedContent, originalFormat);

    // Compress with gzip
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
        chunks: chunks.map(({ index, tokens, heading }) => ({
            index,
            tokens,
            heading,
        })),
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
        rawContent: optimizedContent,
        isToonFormat: isToon,
        chunks,
    };

    return { toonFile, stats };
}

// ---------------------------------------------------------------------------
// .toon file decoding
// ---------------------------------------------------------------------------

/**
 * Decode a .toon file back to its original content
 * @param {Object} toonFile - Toon file data
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
