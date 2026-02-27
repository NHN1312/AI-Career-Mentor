'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileEdit, Sparkles, Upload } from 'lucide-react'

// Dynamic import to avoid SSR issues with pdfjs
const TemplatePreservationEditor = dynamic(
    () => import('@/components/CVEditor/TemplatePreservationEditor'),
    { ssr: false }
)

type EditMode = 'preserve' | 'professional' | null

export default function CVEditorPage() {
    const t = useTranslations('CVEditor')
    const [selectedMode, setSelectedMode] = useState<EditMode>(null)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file)
        }
    }

    if (!selectedMode) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
                        <p className="text-muted-foreground">{t('subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Template Preservation Mode */}
                        <Card
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setSelectedMode('preserve')}
                        >
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileEdit className="w-5 h-5 text-primary" />
                                    <CardTitle>{t('preserveTemplate')}</CardTitle>
                                </div>
                                <CardDescription>{t('preserveTemplateDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span>{t('preserveFeature1')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span>{t('preserveFeature2')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-600">⚠</span>
                                        <span className="text-muted-foreground">{t('preserveWarning')}</span>
                                    </li>
                                </ul>
                                <Button className="w-full mt-4" onClick={() => setSelectedMode('preserve')}>
                                    {t('selectMode')}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Professional Template Mode */}
                        <Card
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setSelectedMode('professional')}
                        >
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    <CardTitle>{t('newTemplate')}</CardTitle>
                                </div>
                                <CardDescription>{t('newTemplateDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span>{t('professionalFeature1')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span>{t('professionalFeature2')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span>{t('professionalFeature3')}</span>
                                    </li>
                                </ul>
                                <Button className="w-full mt-4" onClick={() => setSelectedMode('professional')}>
                                    {t('selectMode')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {selectedMode === 'preserve' ? t('preserveTemplate') : t('newTemplate')}
                        </h1>
                        <p className="text-muted-foreground text-sm">{t('uploadInstruction')}</p>
                    </div>
                    <Button variant="outline" onClick={() => {
                        setSelectedMode(null)
                        setUploadedFile(null)
                    }}>
                        {t('changeMode')}
                    </Button>
                </div>

                {!uploadedFile ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">{t('uploadCV')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{t('uploadHint')}</p>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="cv-upload"
                            />
                            <label htmlFor="cv-upload">
                                <Button asChild>
                                    <span>{t('chooseFile')}</span>
                                </Button>
                            </label>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {selectedMode === 'preserve' ? (
                            <TemplatePreservationEditor file={uploadedFile} />
                        ) : (
                            <div className="border rounded-lg p-4 bg-muted/50">
                                <p className="text-sm">
                                    {t('uploadedFile')}: <span className="font-semibold">{uploadedFile.name}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('editorComingSoon')}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
