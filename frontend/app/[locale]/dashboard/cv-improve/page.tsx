'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, Loader2, FileText, Lightbulb, Download } from 'lucide-react'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'



import { useTranslations } from 'next-intl'

export default function CVImprovementPage() {
    const t = useTranslations('CVMaker')
    const tNav = useTranslations('Navbar')
    const [loading, setLoading] = useState(true)
    const [weaknesses, setWeaknesses] = useState<string[]>([])
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [profileData, setProfileData] = useState<any>(null)
    const [cvData, setCvData] = useState({
        summary: '',
        skills: '',
        experience: '',
        // New fields
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        projects: '',
    })

    useEffect(() => {
        // Initialize pdfMake fonts on client side
        // @ts-ignore
        if (pdfFonts && pdfFonts.pdfMake) {
            // @ts-ignore
            pdfMake.vfs = pdfFonts.pdfMake.vfs
        } else if (pdfFonts) {
            // @ts-ignore
            pdfMake.vfs = pdfFonts
        }
    }, [])


    useEffect(() => {
        fetchCVData()
    }, [])

    const fetchCVData = async () => {
        try {
            const profileRes = await fetch('/api/profile')
            if (profileRes.ok) {
                const profile = await profileRes.json()

                // Store full profile for PDF export
                setProfileData(profile)

                // Load existing data for editing
                setCvData({
                    summary: profile.summary || '',
                    skills: (profile.skills || []).map((s: any) => s.skill_name).join(', '),
                    experience: (profile.work_experience || []).map((e: any) => `${e.position} at ${e.company}`).join('\n'),
                    // Pre-fill defaults
                    fullName: profile.profile?.full_name || profile.profile?.email?.split('@')[0]?.toUpperCase() || '',
                    email: profile.profile?.email || '',
                    phone: '',
                    address: '',
                    linkedin: '',
                    projects: '',
                })

                // Get latest analysis for weaknesses and suggestions
                if (profile.analyses?.length > 0) {
                    const latest = profile.analyses[0]
                    setWeaknesses(latest.weaknesses || [])
                    setSuggestions(latest.suggestions || [])
                }
            }
        } catch (error) {
            console.error('Failed to fetch CV data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleGetAISuggestion = async (field: 'summary' | 'skills' | 'experience') => {
        // TODO: Implement AI suggestion for specific field
        alert(`AI suggestion for ${field} coming soon!`)
    }

    const handleDownloadPDF = () => {
        try {
            // Use edited data from cvData, fall back to defaults if empty (though cvData is pre-filled)
            const name = cvData.fullName || profileData?.profile?.email?.split('@')[0]?.toUpperCase() || 'YOUR NAME'

            // Construct contact info line parts
            const contactParts = [
                cvData.email,
                cvData.phone,
                cvData.address,
                cvData.linkedin
            ].filter(Boolean) // Remove empty strings

            const contactLine = contactParts.join(' | ')

            // Create pdfmake document definition (Harvard style)
            const docDefinition: any = {
                pageSize: 'A4',
                pageMargins: [56, 56, 56, 56], // 20mm margins
                defaultStyle: {
                    font: 'Roboto', // Default font in vfs_fonts
                    fontSize: 11,
                    lineHeight: 1.4,
                },
                content: [
                    // Header
                    { text: name, style: 'name', alignment: 'center' },
                    { text: contactLine, style: 'contact', alignment: 'center', margin: [0, 0, 0, 20] },

                    // Summary
                    ...(cvData.summary ? [
                        { text: 'SUMMARY', style: 'sectionTitle' },
                        { text: cvData.summary, margin: [0, 0, 0, 18] },
                    ] : []),

                    // Education
                    ...(profileData?.education?.length > 0 ? [
                        { text: 'EDUCATION', style: 'sectionTitle' },
                        ...profileData.education.map((edu: any) => ({
                            stack: [
                                {
                                    columns: [
                                        { text: edu.degree, bold: true },
                                        { text: `${edu.start_date || ''} - ${edu.end_date || 'Present'}`, italics: true, fontSize: 10, alignment: 'right' },
                                    ],
                                },
                                { text: edu.institution, italics: true, margin: [0, 2, 0, 0] },
                                ...(edu.field_of_study ? [{ text: `Field: ${edu.field_of_study}`, margin: [0, 2, 0, 0] }] : []),
                            ],
                            margin: [0, 0, 0, 10],
                        })),
                        { text: '', margin: [0, 0, 0, 8] },
                    ] : []),

                    // Work Experience (use cvData.experience if edited, but parsing text back to structured is hard.
                    // For now, we using the profileData for structure, but cvData.experience is just a text block in simple mode.
                    // IMPORTANT: The user asked to EDIT experience. The current UI has a Textarea for experience (cvData.experience).
                    // But the PDF generation code below uses profileData.workExperience (structured).
                    // This causes a disconnect: user edits text in textarea, but PDF uses old structured data.
                    // FIX: If cvData.experience is modified and is a string, we should probably output it as a block of text
                    // OR we parse it. Parsing is hard.
                    // SIMPLE FIX: Check if cvData.experience has content. If so, use it as a text block (like Summary).
                    // If it's a textarea, it's unstructured.
                    // However, to keep high quality formatting, we usually want structured.
                    // But the prompt asked "muốn thêm project... hoặc đơn giản là thêm project".
                    // For Experience, sticking to profileData is inconsistent if they edit the textarea.
                    // DECISION: If cvData.experience is present, use it as the source. 
                    // But wait, the original code initialized cvData.experience from profileData by joining fields.
                    // So cvData.experience IS the editable version. We should use it.
                    // Replaced structured loop with simple text block to respect edits.
                    ...(cvData.experience ? [
                        { text: 'EXPERIENCE', style: 'sectionTitle' },
                        { text: cvData.experience, margin: [0, 0, 0, 18], whiteSpace: 'pre-wrap' }, // Preserve newlines
                    ] : []),

                    // Projects (New Section)
                    ...(cvData.projects ? [
                        { text: 'PROJECTS', style: 'sectionTitle' },
                        { text: cvData.projects, margin: [0, 0, 0, 18], whiteSpace: 'pre-wrap' },
                    ] : []),

                    // Skills (Use cvData.skills to respect edits)
                    ...(cvData.skills ? [
                        { text: 'SKILLS', style: 'sectionTitle' },
                        { text: cvData.skills, lineHeight: 1.6, margin: [0, 0, 0, 18] },
                    ] : []),

                    // Certifications
                    ...(profileData?.certifications?.length > 0 ? [
                        { text: 'CERTIFICATIONS', style: 'sectionTitle' },
                        ...profileData.certifications.map((cert: any) => ({
                            text: [
                                { text: cert.certification_name, bold: true },
                                cert.issuing_organization ? ` - ${cert.issuing_organization}` : '',
                                cert.issue_date ? ` (${cert.issue_date})` : '',
                            ],
                            margin: [0, 0, 0, 5],
                        })),
                    ] : []),
                ],
                styles: {
                    name: { fontSize: 18, bold: true, margin: [0, 0, 0, 5] },
                    contact: { fontSize: 10 },
                    sectionTitle: { fontSize: 12, bold: true, decoration: 'underline', margin: [0, 0, 0, 8] },
                },
            }

            // Generate and download PDF
            const filename = `cv_${name.replace(/\s+/g, '_').toLowerCase()}.pdf`
            pdfMake.createPdf(docDefinition).download(filename)
        } catch (error) {
            console.error('PDF download error:', error)
            alert('Failed to generate PDF. Please try again.')
        }
    }


    if (loading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        {tNav('dashboard')}
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">{t('nav')}</span>
                </div>
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground mt-2">
                    {t('subtitle')}
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Editor */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('personalInfo')}</CardTitle>
                            <CardDescription>
                                {t('personalInfoDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">{t('fullName')}</Label>
                                <Input
                                    id="fullName"
                                    value={cvData.fullName}
                                    onChange={(e) => setCvData({ ...cvData, fullName: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('email')}</Label>
                                <Input
                                    id="email"
                                    value={cvData.email}
                                    onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('phone')}</Label>
                                <Input
                                    id="phone"
                                    value={cvData.phone}
                                    onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">{t('address')}</Label>
                                <Input
                                    id="address"
                                    value={cvData.address}
                                    onChange={(e) => setCvData({ ...cvData, address: e.target.value })}
                                    placeholder="New York, NY"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="linkedin">{t('linkedin')}</Label>
                                <Input
                                    id="linkedin"
                                    value={cvData.linkedin}
                                    onChange={(e) => setCvData({ ...cvData, linkedin: e.target.value })}
                                    placeholder="linkedin.com/in/johndoe"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Summary */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{t('summary')}</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleGetAISuggestion('summary')}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    {t('aiSuggestion')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={cvData.summary}
                                onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                                rows={6}
                                placeholder={t('summaryPlaceholder')}
                            />
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{t('skills')}</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleGetAISuggestion('skills')}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    {t('aiSuggestion')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={cvData.skills}
                                onChange={(e) => setCvData({ ...cvData, skills: e.target.value })}
                                rows={4}
                                placeholder={t('skillsPlaceholder')}
                            />
                        </CardContent>
                    </Card>

                    {/* Work Experience */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{t('workExperience')}</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleGetAISuggestion('experience')}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    {t('aiSuggestion')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={cvData.experience}
                                onChange={(e) => setCvData({ ...cvData, experience: e.target.value })}
                                rows={12}
                                placeholder={t('experiencePlaceholder')}
                            />
                        </CardContent>
                    </Card>

                    {/* Projects */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('projects')}</CardTitle>
                            <CardDescription>
                                {t('projectPlaceholder')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className="min-h-[120px] font-mono text-sm"
                                value={cvData.projects}
                                onChange={(e) => setCvData({ ...cvData, projects: e.target.value })}
                                placeholder={t('projectPlaceholder')}
                            />
                        </CardContent>
                    </Card>

                    {/* Export Button */}
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleDownloadPDF}
                        disabled={!profileData}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {t('export')}
                    </Button>
                </div>

                {/* Sidebar - Weaknesses & Suggestions */}
                <div className="space-y-6">
                    {/* Identified Weaknesses */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{t('areasToImprove')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {weaknesses.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {weaknesses.map((weakness, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-orange-500">•</span>
                                            <span>{weakness}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {t('noWeaknesses')}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Suggestions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{t('suggestions')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {suggestions.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {suggestions.map((suggestion, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {t('noSuggestions')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>


        </div>
    )
}
