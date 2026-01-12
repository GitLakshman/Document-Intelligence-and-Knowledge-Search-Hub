/**
 * Document Processor Service - Handles text extraction from various file types
 */

const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

class DocumentProcessor {
    /**
     * Extract text from a file based on its MIME type
     */
    async extractText(filePath, mimeType) {
        try {
            if (mimeType === 'application/pdf') {
                return await this.extractFromPDF(filePath);
            }
            // For text-based files (txt, md, csv)
            return await this.extractFromText(filePath);
        } catch (error) {
            console.error('Text extraction error:', error);
            throw new Error(`Failed to extract text: ${error.message}`);
        }
    }

    /**
     * Extract text from PDF files
     */
    async extractFromPDF(filePath) {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);

        if (!data?.text) {
            throw new Error('PDF parsing returned no text content');
        }

        return this.cleanText(data.text);
    }

    /**
     * Extract text from plain text files
     */
    async extractFromText(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        return this.cleanText(content);
    }

    /**
     * Clean and normalize extracted text
     */
    cleanText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    /**
     * Delete a file from the filesystem
     */
    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            // File might not exist, which is okay
            if (error.code !== 'ENOENT') {
                console.error('Error deleting file:', error);
                throw error;
            }
        }
    }
}

module.exports = new DocumentProcessor();
