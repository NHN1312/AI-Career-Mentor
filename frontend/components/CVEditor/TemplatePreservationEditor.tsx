'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { PDFDocument } from 'pdf-lib'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Wand2, Download, Loader2 } from 'lucide-react'
import { extractTextPositions, type TextPosition } from '@/lib/pdf/textExtractor'
import { replaceTextSmart } from '@/lib/pdf/textReplacer'
import { useTranslations } from 'next-intl'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure pdfjs worker - use local worker file
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
}

interface TemplatePreservationEditorProps {
    file: File
}

export default function TemplatePreservationEditor({ file }: TemplatePreservationEditorProps) {
    const t = useTranslations('CVEditor')

    const [numPages, setNumPages] = useState<number>()
    const [currentPage, setCurrentPage] = useState(1)
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)

    // Edit state
    const [findText, setFindText] = useState('')
    const [replaceText, setReplaceText] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [isLoadingAI, setIsLoadingAI] = useState(false)
    const [warnings, setWarnings] = useState<string[]>([])

    // Load initial PDF
    useState(() => {
        setPdfBlob(file)
    })

    const handleDocumentLoad = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
    }

    // AI Suggestion
    const handleAISuggest = async () => {
        if (!findText) return

        setIsLoadingAI(true)
        try {
            const response = await fetch('/api/cv/ai-suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: 'freetext',
                    context: { currentText: findText },
                }),
            })

            const { suggestion } = await response.json()
            setReplaceText(suggestion)
        } catch (error) {
            console.error('AI suggestion failed:', error)
        } finally {
            setIsLoadingAI(false)
        }
    }

    // Find and Replace Text
    const handleFindAndReplace = async () => {
        if (!pdfBlob || !findText || !replaceText) return

        setIsProcessing(true)
        setWarnings([])

        try {
            // Load PDF
            const arrayBuffer = await pdfBlob.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arrayBuffer)

            // Extract text positions
            const textPositions = await extractTextPositions(arrayBuffer, findText)

            if (textPositions.length === 0) {
                setWarnings(['Text not found in PDF'])
                setIsProcessing(false)
                return
            }

            const newWarnings: string[] = []

            // Initialize background extractor once
            let getBackgroundColor: any = null
            try {
                const { createBackgroundExtractor } = await import('@/lib/pdf/textExtractor')
                getBackgroundColor = await createBackgroundExtractor(arrayBuffer)
            } catch (error) {
                console.warn('Failed to initialize background extractor:', error)
            }

            // Extract background colors and replace each occurrence
            for (const position of textPositions) {
                // Try to extract background color
                if (getBackgroundColor) {
                    try {
                        const bgColor = await getBackgroundColor(
                            position.pageIndex,
                            position.x + position.width / 2, // Sample from middle of text
                            position.y + position.height / 2
                        )
                        position.backgroundColor = bgColor
                    } catch (error) {
                        console.warn('Failed to extract background color for item:', error)
                    }
                }

                // Replace logic: 
                // The position.text contains the FULL string of the item (e.g. "Hanoi, Vietnam")
                // We want to replace just "Vietnam" with "ThanhHoa" inside it.
                // But we must replace the WHOLE items in PDF.

                // 1. Create the new full string
                const originalFullText = position.text
                const newFullText = originalFullText.replace(findText, replaceText)

                // 2. Use newFullText for replacement
                const result = await replaceTextSmart(pdfDoc, position, newFullText, {
                    allowScaling: true,
                    allowWrapping: false,
                    allowTruncation: true,
                })

                if (result.warning) {
                    newWarnings.push(`Page ${position.pageIndex + 1}: ${result.warning}`)
                }
            }

            // Save modified PDF
            const pdfBytes = await pdfDoc.save()
            const newBlob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
            setPdfBlob(newBlob)

            setWarnings(newWarnings)

            // Clear inputs after successful replacement
            setFindText('')
            setReplaceText('')
        } catch (error) {
            console.error('Replace failed:', error)
            setWarnings(['Failed to replace text. Please try again.'])
        } finally {
            setIsProcessing(false)
        }
    }

    // Download edited PDF
    const handleDownload = () => {
        if (!pdfBlob) return

        const url = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'edited-cv.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: PDF Viewer */}
            <div className="border rounded-lg overflow-hidden bg-gray-50">
                {pdfBlob && (
                    <>
                        <div className="bg-white border-b p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm">
                                    Page {currentPage} of {numPages || '...'}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!numPages || currentPage >= numPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                            <Button onClick={handleDownload} size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>

                        <div className="p-4 flex justify-center">
                            <Document file={pdfBlob} onLoadSuccess={handleDocumentLoad}>
                                <Page pageNumber={currentPage} renderTextLayer={true} renderAnnotationLayer={false} />
                            </Document>
                        </div>
                    </>
                )}
            </div>

            {/* Right: Edit Panel */}
            <div className="space-y-4">
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">Find & Replace Text</h3>

                    <div className="space-y-4">
                        <div>
                            <Label>Find Text</Label>
                            <Input
                                value={findText}
                                onChange={(e) => setFindText(e.target.value)}
                                placeholder="Enter text to find..."
                            />
                        </div>

                        <div>
                            <Label>Replace With</Label>
                            <Textarea
                                value={replaceText}
                                onChange={(e) => setReplaceText(e.target.value)}
                                placeholder="Enter replacement text..."
                                rows={4}
                            />
                        </div>

                        <Button
                            onClick={handleAISuggest}
                            variant="outline"
                            className="w-full"
                            disabled={!findText || isLoadingAI}
                        >
                            {isLoadingAI ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Getting AI Suggestion...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    AI Improve
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={handleFindAndReplace}
                            className="w-full"
                            disabled={!findText || !replaceText || isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Replace Text'
                            )}
                        </Button>
                    </div>

                    {warnings.length > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                            <p className="font-semibold mb-1">Warnings:</p>
                            <ul className="list-disc list-inside space-y-1">
                                {warnings.map((warning, i) => (
                                    <li key={i}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Card>

                <Card className="p-6 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold mb-2 text-blue-900">💡 Tips</h4>
                    <ul className="text-sm space-y-1 text-blue-800">
                        <li>• Enter exact text to find in your CV</li>
                        <li>• Use AI Improve for better suggestions</li>
                        <li>• Text will auto-scale or wrap if too long</li>
                        <li>• Download after all edits are complete</li>
                    </ul>
                </Card>
            </div>
        </div>
    )
}
