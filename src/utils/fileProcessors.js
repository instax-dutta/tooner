/**
 * File processors for various document formats
 * All processing is done client-side for privacy
 */

/**
 * Supported file formats and their MIME types
 */
export const SUPPORTED_FORMATS = {
    // Text formats
    txt: { mime: 'text/plain', category: 'text' },
    md: { mime: 'text/markdown', category: 'text' },
    rtf: { mime: 'application/rtf', category: 'text' },

    // Documents
    pdf: { mime: 'application/pdf', category: 'document' },
    docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document' },
    odt: { mime: 'application/vnd.oasis.opendocument.text', category: 'document' },

    // Data formats
    csv: { mime: 'text/csv', category: 'data' },
    xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'data' },
    xls: { mime: 'application/vnd.ms-excel', category: 'data' },
    json: { mime: 'application/json', category: 'data' },
    xml: { mime: 'application/xml', category: 'data' },
    yaml: { mime: 'text/yaml', category: 'data' },
    toml: { mime: 'text/toml', category: 'data' },

    // Code formats
    js: { mime: 'text/javascript', category: 'code' },
    jsx: { mime: 'text/javascript', category: 'code' },
    ts: { mime: 'text/typescript', category: 'code' },
    tsx: { mime: 'text/typescript', category: 'code' },
    py: { mime: 'text/x-python', category: 'code' },
    java: { mime: 'text/x-java', category: 'code' },
    cpp: { mime: 'text/x-c++', category: 'code' },
    c: { mime: 'text/x-c', category: 'code' },
    h: { mime: 'text/x-c', category: 'code' },
    hpp: { mime: 'text/x-c++', category: 'code' },
    cs: { mime: 'text/x-csharp', category: 'code' },
    go: { mime: 'text/x-go', category: 'code' },
    rs: { mime: 'text/x-rust', category: 'code' },
    rb: { mime: 'text/x-ruby', category: 'code' },
    php: { mime: 'text/x-php', category: 'code' },
    swift: { mime: 'text/x-swift', category: 'code' },
    kt: { mime: 'text/x-kotlin', category: 'code' },
    html: { mime: 'text/html', category: 'code' },
    css: { mime: 'text/css', category: 'code' },
    scss: { mime: 'text/x-scss', category: 'code' },
    less: { mime: 'text/x-less', category: 'code' },
    sql: { mime: 'text/x-sql', category: 'code' },
    sh: { mime: 'text/x-sh', category: 'code' },
    bash: { mime: 'text/x-sh', category: 'code' },
    zsh: { mime: 'text/x-sh', category: 'code' },
};

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} Extension without dot
 */
export function getExtension(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || '';
}

/**
 * Check if file format is supported
 * @param {string} filename - File name
 * @returns {boolean} Whether format is supported
 */
export function isSupported(filename) {
    const ext = getExtension(filename);
    return ext in SUPPORTED_FORMATS;
}

/**
 * Get format info for a file
 * @param {string} filename - File name
 * @returns {Object|null} Format info or null
 */
export function getFormatInfo(filename) {
    const ext = getExtension(filename);
    return SUPPORTED_FORMATS[ext] || null;
}

/**
 * Read file as text
 * @param {File} file - File object
 * @returns {Promise<string>} File content as text
 */
async function readAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/**
 * Read file as ArrayBuffer
 * @param {File} file - File object
 * @returns {Promise<ArrayBuffer>} File content as ArrayBuffer
 */
async function readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Process plain text files
 * @param {File} file - File object
 * @returns {Promise<string>} Extracted text
 */
async function processText(file) {
    return await readAsText(file);
}

/**
 * Process JSON files
 * @param {File} file - File object
 * @returns {Promise<string>} Extracted text
 */
async function processJSON(file) {
    const content = await readAsText(file);
    try {
        // Pretty print JSON for better readability
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed, null, 2);
    } catch {
        // Return as-is if parsing fails
        return content;
    }
}

/**
 * Process PDF files using pdf.js
 * @param {File} file - File object
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} Extracted text
 */
async function processPDF(file, onProgress) {
    // Import pdf.js
    const pdfjs = await import('pdfjs-dist');

    // Use unpkg CDN for the worker - more reliable than local
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';

    const arrayBuffer = await readAsArrayBuffer(file);

    // Load PDF
    const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
    });

    const pdf = await loadingTask.promise;

    const textParts = [];
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item) => item.str)
            .join(' ');
        textParts.push(pageText);

        if (onProgress) {
            onProgress((i / numPages) * 100);
        }
    }

    return textParts.join('\n\n');
}

/**
 * Process DOCX files using mammoth.js
 * @param {File} file - File object
 * @returns {Promise<string>} Extracted text
 */
async function processDOCX(file) {
    // Lazy load mammoth
    const mammoth = await import('mammoth');

    const arrayBuffer = await readAsArrayBuffer(file);
    const result = await mammoth.extractRawText({ arrayBuffer });

    return result.value;
}

/**
 * Process CSV files using PapaParse
 * @param {File} file - File object
 * @returns {Promise<string>} Extracted text
 */
async function processCSV(file) {
    // Lazy load papaparse
    const Papa = await import('papaparse');

    const content = await readAsText(file);
    const parsed = Papa.default.parse(content, {
        header: true,
        skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
        console.warn('CSV parsing warnings:', parsed.errors);
    }

    // Convert to readable text format
    if (parsed.data.length === 0) return '';

    const headers = Object.keys(parsed.data[0]);
    const lines = parsed.data.map((row) =>
        headers.map((h) => `${h}: ${row[h]}`).join(' | ')
    );

    return `Headers: ${headers.join(', ')}\n\n${lines.join('\n')}`;
}

/**
 * Process Excel files using SheetJS
 * @param {File} file - File object
 * @returns {Promise<string>} Extracted text
 */
async function processExcel(file) {
    // Lazy load xlsx
    const XLSX = await import('xlsx');

    const arrayBuffer = await readAsArrayBuffer(file);
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const allText = [];

    for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        allText.push(`--- Sheet: ${sheetName} ---\n${csv}`);
    }

    return allText.join('\n\n');
}

/**
 * Process XML files
 * @param {File} file - File object
 * @returns {Promise<string>} Extracted text
 */
async function processXML(file) {
    const content = await readAsText(file);

    // Extract text content from XML tags
    const textContent = content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Also return the structured version for context
    return `[Structured XML]\n${content}\n\n[Text Content]\n${textContent}`;
}

/**
 * Main file processor
 * Routes to appropriate processor based on file type
 * @param {File} file - File object to process
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{content: string, format: string}>} Processed result
 */
export async function processFile(file, onProgress = () => { }) {
    const ext = getExtension(file.name);
    const formatInfo = getFormatInfo(file.name);

    if (!formatInfo) {
        throw new Error(`Unsupported file format: .${ext}`);
    }

    let content;

    onProgress(10); // Starting

    try {
        switch (ext) {
            // PDF
            case 'pdf':
                content = await processPDF(file, (p) => onProgress(10 + p * 0.8));
                break;

            // DOCX
            case 'docx':
                content = await processDOCX(file);
                onProgress(80);
                break;

            // CSV
            case 'csv':
                content = await processCSV(file);
                onProgress(80);
                break;

            // Excel
            case 'xlsx':
            case 'xls':
                content = await processExcel(file);
                onProgress(80);
                break;

            // JSON
            case 'json':
                content = await processJSON(file);
                onProgress(80);
                break;

            // XML
            case 'xml':
                content = await processXML(file);
                onProgress(80);
                break;

            // All text-based formats (code, markdown, yaml, etc.)
            default:
                content = await processText(file);
                onProgress(80);
                break;
        }

        onProgress(100);

        return {
            content,
            format: ext,
        };
    } catch (error) {
        console.error(`Error processing ${ext} file:`, error);
        throw new Error(`Failed to process ${ext.toUpperCase()} file: ${error.message}`);
    }
}

/**
 * Get accepted file types for input element
 * @returns {string} Accept string for file input
 */
export function getAcceptedTypes() {
    return Object.entries(SUPPORTED_FORMATS)
        .map(([ext, info]) => `.${ext}`)
        .join(',');
}

/**
 * Get list of supported format extensions by category
 * @returns {Object} Formats grouped by category
 */
export function getSupportedFormats() {
    const grouped = {};

    for (const [ext, info] of Object.entries(SUPPORTED_FORMATS)) {
        if (!grouped[info.category]) {
            grouped[info.category] = [];
        }
        grouped[info.category].push(ext);
    }

    return grouped;
}
