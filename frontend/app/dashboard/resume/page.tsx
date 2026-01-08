'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Loader2 } from 'lucide-react'

type AnalysisResult = {
    score: number
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
    keywords: string[]
}

export default function ResumeAnalyzerPage() {
    const [file, setFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [error, setError] = useState<string>('')
    const [isDragging, setIsDragging] = useState(false)

    const acceptedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/webp'
    ]

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) handleFileSelect(droppedFile)
    }

    const handleFileSelect = (selectedFile: File) => {
        if (!acceptedTypes.includes(selectedFile.type)) {
            setError('Please upload PDF, DOCX, TXT, JPG, PNG, or WebP files only')
            return
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB')
            return
        }
        setFile(selectedFile)
        setError('')
        setResult(null)
    }

    const handleAnalyze = async () => {
        if (!file) return

        setIsAnalyzing(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/resume/analyze', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error('Analysis failed')

            const data = await response.json()
            setResult(data)
        } catch (err) {
            setError('Failed to analyze resume. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Resume Analyzer</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Upload Your Resume</CardTitle>
                    <CardDescription>
                        Supported formats: PDF, DOCX, TXT, JPG, PNG, WebP (max 10MB)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                        onDragLeave={() => setIsDragging(false)}
                        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                            }`}
                    >
                        {file ? (
                            <div className="space-y-4">
                                <FileText className="w-12 h-12 mx-auto text-primary" />
                                <div>
                                    <p className="font-medium">{file.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <div className="flex gap-2 justify-center">
                                    <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            'Analyze Resume'
                                        )}
                                    </Button>
                                    <Button variant="outline" onClick={() => setFile(null)}>
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                                <div>
                                    <p className="text-lg font-medium">Drag & drop your resume here</p>
                                    <p className="text-sm text-muted-foreground">or</p>
                                </div>
                                <Button asChild>
                                    <label className="cursor-pointer">
                                        Browse Files
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,.heic,.heif"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleFileSelect(file)
                                            }}
                                        />
                                    </label>
                                </Button>
                            </div>
                        )}
                    </div>
                    {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-6xl font-bold text-primary">{result.score}/100</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-green-600">Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2">
                                {result.strengths.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-orange-600">Areas for Improvement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2">
                                {result.weaknesses.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Improvement Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2">
                                {result.suggestions.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {result.keywords.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Missing Keywords</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.keywords.map((keyword, i) => (
                                        <span key={i} className="px-3 py-1 bg-muted rounded-full text-sm">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
