import * as pdfjsLib from 'pdfjs-dist'

export interface TextPosition {
    pageIndex: number
    x: number
    y: number
    width: number
    height: number
    fontSize: number
    fontFamily: string
    text: string
    color?: number[]
    backgroundColor?: { r: number; g: number; b: number }
}

/**
 * Extract text positions from PDF
 * @param pdfData - PDF as ArrayBuffer
 * @param searchText - Text to find (optional, if not provided returns all text)
 * @returns Array of text positions
 */
export async function extractTextPositions(
    pdfData: ArrayBuffer,
    searchText?: string
): Promise<TextPosition[]> {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData })
    const pdf = await loadingTask.promise
    const textPositions: TextPosition[] = []

    for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
        const page = await pdf.getPage(pageIndex + 1)
        const textContent = await page.getTextContent()
        const viewport = page.getViewport({ scale: 1 })

        textContent.items.forEach((item: any) => {
            // If searchText is provided, only include matching items
            if (searchText && !item.str.includes(searchText)) {
                return
            }

            // Calculate text position in Canvas coordinates (Top-Left origin)
            // item.transform is [scaleX, skewX, skewY, scaleY, x, y] in PDF coords
            const transform = pdfjsLib.Util.transform(
                viewport.transform,
                item.transform
            )

            // transform[4], transform[5] are x, y in Canvas coords
            // For Canvas, y is typically the baseline. We might need adjustments.

            textPositions.push({
                pageIndex,
                x: transform[4],
                y: transform[5], // Canvas Y (from Top)
                width: item.width * viewport.scale, // Scale width to viewport
                height: item.height * viewport.scale, // Scale height
                fontSize: item.transform[0] * viewport.scale, // Scale font size
                fontFamily: item.fontName || 'Unknown',
                text: item.str,
                color: item.color,
            })
        })
    }

    return textPositions
}

/**
 * Create a reusable background color extractor for a PDF
 * @param pdfData - PDF as ArrayBuffer
 * @returns Function to extract color at specific position
 */
export async function createBackgroundExtractor(pdfData: ArrayBuffer) {
    // Clone buffer to prevent "detached ArrayBuffer" errors if worker transfers it
    const data = pdfData.slice(0)
    const loadingTask = pdfjsLib.getDocument({ data })
    const pdf = await loadingTask.promise

    // Cache for pages to avoid reloading page for every text on same page
    const pageCache = new Map<number, any>()

    return async (
        pageIndex: number,
        x: number,
        y: number
    ): Promise<{ r: number; g: number; b: number }> => {
        let page = pageCache.get(pageIndex)
        if (!page) {
            page = await pdf.getPage(pageIndex + 1)
            pageCache.set(pageIndex, page)
        }

        const viewport = page.getViewport({ scale: 1 })

        // Create canvas
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d', { willReadFrequently: true })!
        canvas.width = viewport.width
        canvas.height = viewport.height

        // Render PDF page to canvas
        await page.render({
            canvasContext: context,
            viewport,
            canvas
        } as any).promise

        // Sample a few pixels around the point
        const sampleX = Math.max(0, Math.floor(x - 5))
        const sampleY = Math.max(0, Math.floor(y - 5))

        const imageData = context.getImageData(sampleX, sampleY, 1, 1)
        const [r, g, b] = imageData.data

        return { r, g, b }
    }
}

/**
 * Extract all text from PDF (for parsing/analysis)
 */
export async function extractAllText(pdfData: ArrayBuffer): Promise<string> {
    const loadingTask = pdfjsLib.getDocument({ data: pdfData })
    const pdf = await loadingTask.promise
    let allText = ''

    for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
        const page = await pdf.getPage(pageIndex + 1)
        const textContent = await page.getTextContent()

        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')

        allText += pageText + '\n\n'
    }

    return allText
}

/**
 * Detect if PDF is scanned (image-based)
 */
export async function detectScannedPDF(pdfData: ArrayBuffer): Promise<boolean> {
    const text = await extractAllText(pdfData)

    // If text content is very minimal, likely scanned
    const textLength = text.trim().length
    return textLength < 100
}

/**
 * Auto-detect CV sections in text
 */
export function detectCVSections(text: string): {
    summary?: string
    experience?: string
    education?: string
    skills?: string
    projects?: string
} {
    const sections: any = {}

    // Common section headers (case insensitive)
    const sectionPatterns = {
        summary: /(?:summary|profile|about|objective)[:\s]+([\s\S]*?)(?=\n\n|experience|education|skills|$)/i,
        experience: /(?:experience|work history|employment)[:\s]+([\s\S]*?)(?=\n\n|education|skills|projects|$)/i,
        education: /(?:education|academic|qualifications)[:\s]+([\s\S]*?)(?=\n\n|skills|projects|experience|$)/i,
        skills: /(?:skills|technical skills|competencies)[:\s]+([\s\S]*?)(?=\n\n|projects|education|experience|$)/i,
        projects: /(?:projects|portfolio)[:\s]+([\s\S]*?)(?=\n\n|skills|education|experience|$)/i,
    }

    for (const [section, pattern] of Object.entries(sectionPatterns)) {
        const match = text.match(pattern)
        if (match && match[1]) {
            sections[section] = match[1].trim()
        }
    }

    return sections
}
