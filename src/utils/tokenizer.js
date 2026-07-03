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
 * Determine if a format produces or uses Markdown layout.
 * PDF, DOCX, PPTX, HTML, EPUB, XML are all converted to Markdown by MarkItDownJS.
 */
function isMarkdownFormat(format) {
    const fmt = (format || '').toLowerCase().replace(/^\./, '');
    return ['md', 'markdown', 'mdx', 'pdf', 'docx', 'pptx', 'epub', 'rtf', 'html', 'htm', 'xml', 'csv'].includes(fmt);
}

// ---------------------------------------------------------------------------
// Token counting
// ---------------------------------------------------------------------------

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
// Shared text normalization
// ---------------------------------------------------------------------------

function normalizeText(text) {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/[ \t]+$/gm, '')
        .trim();
}

// ---------------------------------------------------------------------------
// Markdown optimizer (used for all MarkItDownJS output)
// ---------------------------------------------------------------------------

function optimizeMarkdown(text) {
    let out = text;
    out = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    out = out.replace(/<!--[\s\S]*?-->/g, '');
    out = out.replace(/^!\[.*?\]\(https?:\/\/img\.shields\.io\/[^)]*\)[ \t]*$/gm, '');
    out = out.replace(/^!\[.*?\]\(https?:\/\/github\.com\/[^)]*actions\/workflows\/[^)]*badge\.svg[^)]*\)[ \t]*$/gm, '');
    out = out.replace(/^(.+)\n={3,}[ \t]*$/gm, '# $1');
    out = out.replace(/^(.+)\n-{3,}[ \t]*$/gm, '## $1');
    out = out.replace(/^[ \t]*([-*_][ \t]*){3,}$/gm, '---');
    out = out.replace(/<br\s*\/?>/gi, '');
    out = out.replace(/<hr\s*\/?>/gi, '');
    out = out.replace(/\[(https?:\/\/[^\]]+)\]\(\1\)/g, '$1');
    out = out.replace(/\[\]\([^)]*\)/g, '');
    out = out.replace(/(?<!^)[ \t]{2,}/gm, ' ');
    out = out.replace(/^([ \t]*[-*+])[ \t]{2,}/gm, '$1 ');
    out = out.replace(/^([ \t]*\d+\.)[ \t]{2,}/gm, '$1 ');
    out = out.replace(/\*\* +/g, '**').replace(/ +\*\*/g, '**');
    out = out.replace(/\* +/g, '*').replace(/ +\*/g, '*');
    out = out.replace(/_ +/g, '_').replace(/ +_/g, '_');
    out = out.replace(/^#{1,6}[ \t]*$/gm, '');
    out = out.replace(/\n{3,}/g, '\n\n');
    out = out.replace(/[ \t]+$/gm, '');
    return out.trim();
}

// ---------------------------------------------------------------------------
// Code optimizer (used for files via PlainTextConverter)
// ---------------------------------------------------------------------------

function optimizeCode(text) {
    let out = text;
    out = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    out = out.replace(/\/\*(?!\*)[\s\S]*?\*\//g, '');
    out = out.replace(/^[ \t]*\/\/(?!.*(?:eslint-disable|eslint-enable|@ts-ignore|@ts-expect-error|@ts-nocheck|@ts-check|@type|@param|@returns|@typedef|@template|@override|@deprecated|@see|@todo|@fixme|@hack|noqa|noinspection|pragma|sourceMappingURL|istanbul|c8)).*$/gim, '');
    out = out.replace(/^[ \t]*#(?!!\/|.*(?:noqa|type:|pragma|pylint|flake8|isort|mypy|noinspection|coding|encoding|frozen_string_literal)).*$/gm, '');
    out = out.replace(/\n{4,}/g, '\n\n');
    out = out.replace(/[ \t]+$/gm, '');
    out = out.replace(/\t/g, '  ');
    return out.trim();
}

// ---------------------------------------------------------------------------
// JSON optimizer (essential for TOON encoding)
// ---------------------------------------------------------------------------

function removeNulls(obj) {
    if (Array.isArray(obj)) return obj.map(removeNulls);
    if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== null) cleaned[key] = removeNulls(value);
        }
        return cleaned;
    }
    return obj;
}

function optimizeJson(text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        return { content: normalizeText(text), isToon: false };
    }

    const cleaned = removeNulls(parsed);

    try {
        const toonContent = encodeToon(cleaned);
        return { content: toonContent, isToon: true };
    } catch (error) {
        console.warn('TOON encoding failed, falling back to minified JSON:', error);
    }

    return { content: JSON.stringify(cleaned), isToon: false };
}

// ---------------------------------------------------------------------------
// Content optimizer — routes by format
// ---------------------------------------------------------------------------

export function optimizeContent(content, format) {
    if (!content || typeof content !== 'string') {
        return { content: '', isToon: false };
    }

    const fmt = (format || '').toLowerCase().replace(/^\./, '');

    if (isMarkdownFormat(fmt)) {
        return { content: optimizeMarkdown(content), isToon: false };
    }

    if (fmt === 'json' || fmt === 'jsonl' || fmt === 'jsonc') {
        return optimizeJson(content);
    }

    if (CODE_EXTENSIONS.has(fmt)) {
        return { content: optimizeCode(content), isToon: false };
    }

    return { content: normalizeText(content), isToon: false };
}

// ---------------------------------------------------------------------------
// Compression utilities
// ---------------------------------------------------------------------------

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

export async function decompressContent(compressed) {
    const { gunzip, strFromU8 } = await import('fflate');
    return new Promise((resolve, reject) => {
        gunzip(compressed, (err, decompressed) => {
            if (err) reject(err);
            else resolve(strFromU8(decompressed));
        });
    });
}

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

const DEFAULT_MAX_CHUNK_TOKENS = 2000;

function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

function splitLargeSection(text, maxTokens = DEFAULT_MAX_CHUNK_TOKENS) {
    if (estimateTokens(text) <= maxTokens) {
        return [text];
    }

    const paragraphs = text.split(/\n\n+/);
    const pieces = [];
    let buffer = '';

    for (const para of paragraphs) {
        const combined = buffer ? buffer + '\n\n' + para : para;
        if (estimateTokens(combined) > maxTokens && buffer) {
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

function applyOverlap(pieces, overlapTokens) {
    if (overlapTokens <= 0 || pieces.length <= 1) return pieces;
    return pieces.map((piece, i) => {
        if (i === 0) return piece;
        const prev = pieces[i - 1];
        const prevTokens = estimateTokens(prev);
        if (prevTokens <= overlapTokens) return piece;
        const words = prev.split(/\s+/);
        let overlapWords = [];
        let tokenCount = 0;
        for (let j = words.length - 1; j >= 0; j--) {
            tokenCount += estimateTokens(words[j]) + 1;
            if (tokenCount > overlapTokens) break;
            overlapWords.unshift(words[j]);
        }
        return overlapWords.join(' ') + '\n\n' + piece;
    });
}

async function createChunks(content, format, { maxTokens = DEFAULT_MAX_CHUNK_TOKENS, overlap = 0 } = {}) {
    const isMd = isMarkdownFormat(format);
    const rawSections = [];

    if (isMd) {
        const lines = content.split('\n');
        let currentHeading = null;
        let currentBody = [];

        for (const line of lines) {
            const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
            if (headingMatch) {
                if (currentBody.length > 0 || currentHeading !== null) {
                    rawSections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
                }
                currentHeading = headingMatch[2].trim();
                currentBody = [];
            } else {
                currentBody.push(line);
            }
        }
        if (currentBody.length > 0 || currentHeading !== null) {
            rawSections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
        }
    } else {
        const blocks = content.split(/\n\n+/);
        for (const block of blocks) {
            const trimmed = block.trim();
            if (trimmed) rawSections.push({ heading: null, body: trimmed });
        }
    }

    const chunks = [];
    let index = 0;

    for (const section of rawSections) {
        if (!section.body && !section.heading) continue;

        const textToChunk = section.heading
            ? (section.body ? `# ${section.heading}\n\n${section.body}` : `# ${section.heading}`)
            : section.body;

        const subPieces = applyOverlap(splitLargeSection(textToChunk, maxTokens), overlap);

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

    if (chunks.length === 0 && content.trim()) {
        const tokens = await countTokens(content);
        chunks.push({ index: 0, content: content.trim(), tokens, heading: null });
    }

    return chunks;
}

// ---------------------------------------------------------------------------
// .toon file generation
// ---------------------------------------------------------------------------

export async function generateToonFile({
    originalFilename,
    originalFormat,
    originalSize,
    rawContent,
    chunkOptions = {},
}) {
    const originalTokens = await countTokens(rawContent);
    const { content: optimizedContent, isToon } = optimizeContent(rawContent, originalFormat);
    const optimizedTokens = await countTokens(optimizedContent);
    const chunks = await createChunks(optimizedContent, originalFormat, chunkOptions);
    const compressed = await compressContent(optimizedContent);
    const compressedBase64 = uint8ToBase64(compressed);

    const tokenReduction = originalTokens > 0
        ? Math.round(((originalTokens - optimizedTokens) / originalTokens) * 100)
        : 0;

    const sizeReduction = originalSize > 0
        ? Math.round(((originalSize - compressed.length) / originalSize) * 100)
        : 0;

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
        chunks: chunks.map(({ index, tokens, heading }) => ({ index, tokens, heading })),
        metadata: {
            created: new Date().toISOString(),
            generator: 'Tooner v1.0',
        },
    };

    const stats = {
        originalTokens,
        optimizedTokens,
        tokenReduction,
        originalSize,
        compressedSize: compressed.length,
        sizeReduction,
        rawContent: optimizedContent,
        isToonFormat: isToon,
        chunks: chunks.map(({ index, content, tokens, heading }) => ({ index, content, tokens, heading })),
    };

    return { toonFile, stats };
}

// ---------------------------------------------------------------------------
// .toon file decoding
// ---------------------------------------------------------------------------

export async function decodeToonFile(toonFile) {
    if (!toonFile?.optimized?.content) {
        throw new Error('Invalid .toon file format');
    }

    const binary = atob(toonFile.optimized.content);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    const content = await decompressContent(bytes);

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
