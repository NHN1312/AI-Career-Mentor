import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib'
import type { TextPosition } from './textExtractor'

/**
 * Calculate approximate text width
 */
export function calculateTextWidth(text: string, fontSize: number): number {
    // Rough estimation: 0.6 * fontSize per character
    return text.length * fontSize * 0.6
}

/**
 * Wrap text into multiple lines
 */
export function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const lineWidth = calculateTextWidth(testLine, fontSize)

        if (lineWidth > maxWidth && currentLine) {
            lines.push(currentLine)
            currentLine = word
        } else {
            currentLine = testLine
        }
    }

    if (currentLine) {
        lines.push(currentLine)
    }

    return lines
}

/**
 * Smart text replacement with overflow handling
 */
export async function replaceTextSmart(
    pdfDoc: PDFDocument,
    position: TextPosition,
    newText: string,
    options: {
        allowScaling?: boolean
        allowWrapping?: boolean
        allowTruncation?: boolean
    } = {}
): Promise<{ success: boolean; warning?: string }> {
    const {
        allowScaling = true,
        allowWrapping = false, // Disable by default to avoid layout issues
        allowTruncation = true,
    } = options

    const page = pdfDoc.getPages()[position.pageIndex]
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Calculate dimensions
    const newWidth = font.widthOfTextAtSize(newText, position.fontSize)
    const availableWidth = position.width

    let finalText = newText
    let finalFontSize = position.fontSize
    let warning: string | undefined

    // Handle overflow
    if (newWidth > availableWidth) {
        const overflowRatio = newWidth / availableWidth

        // Option 1: Scale down (if reasonable)
        if (allowScaling && overflowRatio < 1.5) {
            finalFontSize = position.fontSize / overflowRatio
            warning = 'Text scaled down to fit'
        }
        // Option 2: Truncate
        else if (allowTruncation) {
            // Calculate how many characters fit
            let truncated = newText
            let truncatedWidth = newWidth

            while (truncatedWidth > availableWidth && truncated.length > 3) {
                truncated = truncated.substring(0, truncated.length - 1)
                truncatedWidth = font.widthOfTextAtSize(truncated + '...', finalFontSize)
            }

            finalText = truncated + '...'
            warning = 'Text truncated to fit'
        }
    }

    // Calculate actual text bounds for precise covering
    const textWidth = font.widthOfTextAtSize(finalText, finalFontSize)
    const textHeight = finalFontSize * 1.4 // Increase padding to ensure full coverage

    // Use background color from position, or default to white
    const bgColor = position.backgroundColor
        ? rgb(position.backgroundColor.r / 255, position.backgroundColor.g / 255, position.backgroundColor.b / 255)
        : rgb(1, 1, 1)

    // Cover old text with rectangle - use generous bounds
    // Calculate geometric parameters
    // position.y is now Canvas Y (distance from Top)
    // PDF Y is distance from Bottom

    // Convert Canvas Y to PDF Y
    // Note: Canvas Y usually points to baseline for text items in pdf.js
    const pdfY = page.getHeight() - position.y

    const descent = finalFontSize * 0.25
    const ascent = finalFontSize * 0.85

    // Rect Y in PDF coords (Bottom-Left)
    // We want to cover from [pdfY - descent] to [pdfY + ascent]
    const rectY = pdfY - descent
    const rectHeight = ascent + descent

    page.drawRectangle({
        x: position.x - 2, // Extra left padding
        y: rectY,
        width: Math.max(textWidth + 4, position.width + 4), // Extra width
        height: rectHeight,
        color: bgColor,
        borderWidth: 0,
    })

    // Draw new text
    page.drawText(finalText, {
        x: position.x,
        y: pdfY, // drawText expects baseline y in PDF coords
        size: finalFontSize,
        font,
        color: rgb(0, 0, 0),
    })

    return { success: true, warning }
}

/**
 * Batch replace multiple text instances
 */
export async function batchReplaceText(
    pdfDoc: PDFDocument,
    replacements: Array<{ position: TextPosition; newText: string }>
): Promise<{ success: boolean; warnings: string[] }> {
    const warnings: string[] = []

    for (const { position, newText } of replacements) {
        const result = await replaceTextSmart(pdfDoc, position, newText)
        if (result.warning) {
            warnings.push(`Page ${position.pageIndex + 1}: ${result.warning}`)
        }
    }

    return { success: true, warnings }
}
