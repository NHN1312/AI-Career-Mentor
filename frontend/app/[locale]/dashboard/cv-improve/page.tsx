'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, Loader2, FileText, Lightbulb, Download, Wand2, ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslations, useLocale } from 'next-intl'
import { CVPreview } from '@/components/CVPreview'
import { AIContextDialog } from '@/components/AIContextDialog'

// Templates
const TEMPLATES = [
    { id: 'harvard', name: 'Harvard Standard', previewColor: 'bg-white' },
    { id: 'modern', name: 'Modern Clean', previewColor: 'bg-slate-50' },
    { id: 'creative', name: 'Creative Bold', previewColor: 'bg-blue-50' }
]

export default function CVBuilderPage() {
    const t = useTranslations('CVMaker')
    const tNav = useTranslations('CVBuilder') // Support for new keys if CVMaker is old
    const tCommon = useTranslations('Navbar')
    const locale = useLocale()

    // Note: Temporary fallback if new translations aren't loaded in client yet
    const translate = (key: string) => {
        try {
            return tNav(key)
        } catch {
            return t(key)
        }
    }

    const [activeTemplate, setActiveTemplate] = useState('harvard')
    const [activeTab, setActiveTab] = useState('personal')
    const [generating, setGenerating] = useState<string | null>(null) // 'summary' | 'experience'

    // AI Dialog state
    const [aiDialogOpen, setAiDialogOpen] = useState(false)
    const [aiDialogSection, setAiDialogSection] = useState<'summary' | 'experience' | 'project' | 'skills'>('summary')
    const [aiDialogIndex, setAiDialogIndex] = useState<number | null>(null) // For array items

    const [cvData, setCvData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedin: '',
        summary: '',
        experience: [] as Array<{
            organization: string
            position: string
            startDate: string
            endDate: string
            location: string
            description: string
        }>,
        education: [] as Array<{
            institution: string
            degree: string
            field: string
            startDate: string
            endDate: string
            location: string
            gpa: string
            description: string
        }>,
        skills: '',
        projects: [] as Array<{
            name: string
            description: string
            role: string
            startDate: string
            endDate: string
            githubLink: string
            technologies: string
        }>
    })

    useEffect(() => {
        // Load initial data from profile if available
        fetchCVData()
    }, [])

    const fetchCVData = async () => {
        try {
            const res = await fetch('/api/profile')
            if (res.ok) {
                const profile = await res.json()
                setCvData(prev => ({
                    ...prev,
                    fullName: profile.profile?.full_name || '',
                    email: profile.profile?.email || '',
                    summary: profile.summary || '',
                    skills: (profile.skills || []).map((s: any) => s.skill_name).join(', '),
                    experience: (profile.work_experience || []).map((e: any) => ({
                        organization: e.company || '',
                        position: e.position || '',
                        startDate: e.start_date || '',
                        endDate: e.end_date || '',
                        location: '',
                        description: e.description || ''
                    })),
                    education: (profile.education || []).map((e: any) => ({
                        institution: e.institution || '',
                        degree: e.degree || '',
                        field: e.field_of_study || '',
                        startDate: e.start_date || '',
                        endDate: e.end_date || '',
                        location: '',
                        gpa: e.gpa || '',
                        description: ''
                    }))
                }))
            }
        } catch (e) {
            console.error("Failed to load profile", e)
        }
    }

    const handleMagicWrite = async (section: string, context: any = {}, index?: number) => {
        const genKey = index !== undefined ? `${section}-${index}` : section
        setGenerating(genKey)
        try {
            const response = await fetch('/api/cv/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section,
                    context,
                    currentText: index !== undefined && Array.isArray(cvData[section as keyof typeof cvData])
                        ? (cvData[section as keyof typeof cvData] as any)[index]?.description
                        : cvData[section as keyof typeof cvData],
                    locale
                })
            })

            if (response.ok) {
                const data = await response.json()

                if (index !== undefined && section === 'experience') {
                    const newExp = [...cvData.experience]
                    newExp[index].description = data.text
                    setCvData(prev => ({ ...prev, experience: newExp }))
                } else if (index !== undefined && section === 'education') {
                    const newEdu = [...cvData.education]
                    newEdu[index].description = data.text
                    setCvData(prev => ({ ...prev, education: newEdu }))
                } else if (index !== undefined && section === 'projects') {
                    const newProj = [...cvData.projects]
                    newProj[index].description = data.text
                    setCvData(prev => ({ ...prev, projects: newProj }))
                } else {
                    setCvData(prev => ({
                        ...prev,
                        [section]: data.text
                    }))
                }
            }
        } catch (error) {
            console.error("AI Generation failed", error)
        } finally {
            setGenerating(null)
        }
    }

    // New context-based AI generation handler
    const handleAIGenerate = async (context: Record<string, any>) => {
        const genKey = aiDialogIndex !== null ? `${aiDialogSection}-${aiDialogIndex}` : aiDialogSection
        setGenerating(genKey)

        try {
            const response = await fetch('/api/cv/ai-suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: aiDialogSection,
                    context
                })
            })

            if (!response.ok) {
                throw new Error('Failed to generate content')
            }

            const data = await response.json()
            const suggestion = data.suggestion

            // Update the appropriate section
            if (aiDialogSection === 'summary') {
                setCvData(prev => ({ ...prev, summary: suggestion }))
            } else if (aiDialogSection === 'experience' && aiDialogIndex !== null) {
                const newExp = [...cvData.experience]
                newExp[aiDialogIndex].description = suggestion
                setCvData(prev => ({ ...prev, experience: newExp }))
            } else if (aiDialogSection === 'project' && aiDialogIndex !== null) {
                const newProj = [...cvData.projects]
                newProj[aiDialogIndex].description = suggestion
                setCvData(prev => ({ ...prev, projects: newProj }))
            } else if (aiDialogSection === 'skills') {
                setCvData(prev => ({ ...prev, skills: suggestion }))
            }
        } catch (error) {
            console.error('AI generation error:', error)
            throw error // Re-throw to let dialog handle error display
        } finally {
            setGenerating(null)
        }
    }

    const openAIDialog = (section: 'summary' | 'experience' | 'project' | 'skills', index?: number) => {
        setAiDialogSection(section)
        setAiDialogIndex(index ?? null)
        setAiDialogOpen(true)
    }

    const downloadPDF = async () => {
        try {
            console.log('Starting client-side PDF generation')

            // Dynamically import pdfMake (client-side only)
            const pdfMake = (await import('pdfmake/build/pdfmake')).default
            const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default

                // Configure pdfMake vfs - pdfFonts is already the vfs object
                ; (pdfMake as any).vfs = pdfFonts

            const docDefinition = getDocDefinition(cvData, activeTemplate)

            // Generate and download PDF
            pdfMake.createPdf(docDefinition as any).download(`cv-${cvData.fullName || 'draft'}.pdf`)
            console.log('PDF download initiated successfully')
        } catch (error) {
            const err = error as Error
            console.error('Download failed:', err)
            alert(`Download failed: ${err?.message || 'Unknown error'}. Check console for details.`)
        }
    }

    // PDF document definition (moved from server-side)
    const getDocDefinition = (data: typeof cvData, templateId: string) => {
        const isModern = templateId === 'modern'
        const isCreative = templateId === 'creative'

        return {
            content: [
                { text: data.fullName || 'Your Name', style: 'header', alignment: isModern ? 'left' : 'center' },
                {
                    text: [
                        data.email || '',
                        data.phone ? ` | ${data.phone}` : '',
                        data.address ? ` | ${data.address}` : '',
                        data.linkedin ? ` | ${data.linkedin}` : ''
                    ].filter(Boolean).join(''),
                    style: 'contact',
                    alignment: isModern ? 'left' : 'center'
                },
                { text: '\n' },

                // Summary
                ...(data.summary ? [
                    { text: 'Professional Summary', style: 'sectionHeader' },
                    { text: data.summary, margin: [0, 5, 0, 15] }
                ] : []),

                // Experience
                ...(data.experience && data.experience.length > 0 ? [
                    { text: 'Work Experience', style: 'sectionHeader' },
                    ...data.experience.flatMap((exp: any) => [
                        {
                            columns: [
                                {
                                    width: '*',
                                    stack: [
                                        { text: exp.organization || 'Company', bold: true },
                                        { text: exp.position || 'Position', italics: true, fontSize: 10, margin: [0, 2, 0, 0] }
                                    ]
                                },
                                {
                                    width: 'auto',
                                    stack: [
                                        { text: exp.location || '', alignment: 'right', fontSize: 10 },
                                        { text: `${exp.startDate || 'Start'} - ${exp.endDate || 'End'}`, alignment: 'right', fontSize: 10, margin: [0, 2, 0, 0] }
                                    ]
                                }
                            ],
                            margin: [0, 5, 0, 3]
                        },
                        ...(exp.description ? [{ text: exp.description, margin: [0, 3, 0, 10] }] : [{ text: '\n' }])
                    ]),
                    { text: '\n' }
                ] : []),

                // Education
                ...(data.education && data.education.length > 0 ? [
                    { text: 'Education', style: 'sectionHeader' },
                    ...data.education.flatMap((edu: any) => [
                        {
                            columns: [
                                {
                                    width: '*',
                                    stack: [
                                        { text: edu.institution || 'Institution', bold: true },
                                        {
                                            text: [
                                                edu.degree || 'Degree',
                                                edu.field ? ` in ${edu.field}` : '',
                                                edu.gpa ? ` - GPA: ${edu.gpa}` : ''
                                            ].filter(Boolean).join(''),
                                            fontSize: 10,
                                            margin: [0, 2, 0, 0]
                                        }
                                    ]
                                },
                                {
                                    width: 'auto',
                                    stack: [
                                        { text: edu.location || '', alignment: 'right', fontSize: 10 },
                                        { text: `${edu.startDate || 'Start'} - ${edu.endDate || 'End'}`, alignment: 'right', fontSize: 10, margin: [0, 2, 0, 0] }
                                    ]
                                }
                            ],
                            margin: [0, 5, 0, 3]
                        },
                        ...(edu.description ? [{ text: edu.description, margin: [0, 3, 0, 10] }] : [{ text: '\n' }])
                    ]),
                    { text: '\n' }
                ] : []),

                // Skills
                ...(data.skills ? [
                    { text: 'Skills', style: 'sectionHeader' },
                    { text: data.skills, margin: [0, 5, 0, 15] }
                ] : []),

                // Projects
                ...(data.projects && data.projects.length > 0 ? [
                    { text: 'Projects', style: 'sectionHeader' },
                    ...data.projects.flatMap((proj: any) => [
                        {
                            columns: [
                                {
                                    width: '*',
                                    stack: [
                                        { text: proj.name || 'Project Name', bold: true },
                                        { text: proj.role || '', italics: true, fontSize: 10, margin: [0, 2, 0, 0] }
                                    ]
                                },
                                {
                                    width: 'auto',
                                    text: `${proj.startDate || 'Start'} - ${proj.endDate || 'End'}`,
                                    alignment: 'right',
                                    fontSize: 10
                                }
                            ],
                            margin: [0, 5, 0, 3]
                        },
                        ...(proj.technologies ? [{
                            text: `Technologies: ${proj.technologies}`,
                            fontSize: 9,
                            color: '#666',
                            margin: [0, 2, 0, 2]
                        }] : []),
                        ...(proj.githubLink ? [{
                            text: proj.githubLink,
                            link: proj.githubLink,
                            color: 'blue',
                            fontSize: 9,
                            margin: [0, 0, 0, 2]
                        }] : []),
                        ...(proj.description ? [{ text: proj.description, margin: [0, 3, 0, 10] }] : [{ text: '\n' }])
                    ]),
                    { text: '\n' }
                ] : []),
            ],
            styles: {
                header: {
                    fontSize: 22,
                    bold: true,
                    color: isCreative ? '#2563eb' : 'black'
                },
                contact: {
                    fontSize: 10,
                    color: '#666',
                    margin: [0, 2, 0, 10]
                },
                sectionHeader: {
                    fontSize: 14,
                    bold: true,
                    decoration: isModern ? undefined : 'underline',
                    margin: [0, 10, 0, 5],
                    color: isCreative ? '#2563eb' : 'black'
                }
            }
        }
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header / Toolbar */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-background z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        {tCommon('dashboard')}
                    </Link>
                    <h1 className="text-xl font-bold border-l pl-4">{translate('title')}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-muted p-1 rounded-lg">
                        {TEMPLATES.map(tmp => (
                            <button
                                key={tmp.id}
                                onClick={() => setActiveTemplate(tmp.id)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${activeTemplate === tmp.id ? 'bg-background shadow font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {translate(`template${tmp.name.split(' ')[0]}`) || tmp.name}
                            </button>
                        ))}
                    </div>
                    <Button onClick={downloadPDF} size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        {translate('downloadPdf')}
                    </Button>
                </div>
            </div>

            {/* Main Content: Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Editor */}
                <div className="w-1/2 border-r bg-background flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <div className="px-6 pt-4 border-b">
                            <TabsList className="w-full justify-start overflow-x-auto h-auto p-2 gap-1 bg-transparent">
                                <TabsTrigger value="personal" className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border">{translate('personalInfo')}</TabsTrigger>
                                <TabsTrigger value="summary" className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border">{translate('summary')}</TabsTrigger>
                                <TabsTrigger value="experience" className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border">{translate('experience')}</TabsTrigger>
                                <TabsTrigger value="education" className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border">Education</TabsTrigger>
                                <TabsTrigger value="skills" className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border">{translate('skills')}</TabsTrigger>
                                <TabsTrigger value="projects" className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border">{translate('projects')}</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                                <TabsContent value="personal" className="mt-0 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{translate('fullName') || 'Full Name'}</Label>
                                            <Input value={cvData.fullName} onChange={e => setCvData({ ...cvData, fullName: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{translate('email') || 'Email'}</Label>
                                            <Input value={cvData.email} onChange={e => setCvData({ ...cvData, email: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{translate('phone') || 'Phone'}</Label>
                                            <Input value={cvData.phone} onChange={e => setCvData({ ...cvData, phone: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{translate('address') || 'Address'}</Label>
                                            <Input value={cvData.address} onChange={e => setCvData({ ...cvData, address: e.target.value })} />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>{translate('linkedin') || 'LinkedIn'}</Label>
                                            <Input value={cvData.linkedin} onChange={e => setCvData({ ...cvData, linkedin: e.target.value })} />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="summary" className="mt-0 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base">{translate('summary')}</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                            onClick={() => openAIDialog('summary')}
                                            disabled={!!generating}
                                        >
                                            {generating === 'summary' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                            {translate('magicButton')}
                                        </Button>
                                    </div>
                                    <Textarea
                                        className="min-h-[300px] resize-none"
                                        placeholder={t('summaryPlaceholder') || 'Write your summary...'}
                                        value={cvData.summary}
                                        onChange={e => setCvData({ ...cvData, summary: e.target.value })}
                                    />
                                </TabsContent>

                                <TabsContent value="experience" className="mt-0 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base">{translate('experience')}</Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setCvData({
                                                    ...cvData,
                                                    experience: [...cvData.experience, {
                                                        organization: '',
                                                        position: '',
                                                        startDate: '',
                                                        endDate: '',
                                                        location: '',
                                                        description: ''
                                                    }]
                                                })
                                            }}
                                        >
                                            {translate('addExperience')}
                                        </Button>
                                    </div>

                                    <ScrollArea className="h-[500px]">
                                        <div className="space-y-4 pr-4">
                                            {cvData.experience.map((exp, index) => (
                                                <Card key={index}>
                                                    <CardContent className="pt-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <Label className="text-sm font-semibold">{tNav('experienceNumber', { number: index + 1 })}</Label>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newExp = cvData.experience.filter((_, i) => i !== index)
                                                                    setCvData({ ...cvData, experience: newExp })
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label className="text-xs">{translate('organization')}</Label>
                                                                <Input
                                                                    value={exp.organization}
                                                                    onChange={e => {
                                                                        const newExp = [...cvData.experience]
                                                                        newExp[index].organization = e.target.value
                                                                        setCvData({ ...cvData, experience: newExp })
                                                                    }}
                                                                    placeholder="Company name"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">{translate('position')}</Label>
                                                                <Input
                                                                    value={exp.position}
                                                                    onChange={e => {
                                                                        const newExp = [...cvData.experience]
                                                                        newExp[index].position = e.target.value
                                                                        setCvData({ ...cvData, experience: newExp })
                                                                    }}
                                                                    placeholder="Job title"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <Label className="text-xs">Start Date</Label>
                                                                <Input
                                                                    value={exp.startDate}
                                                                    onChange={e => {
                                                                        const newExp = [...cvData.experience]
                                                                        newExp[index].startDate = e.target.value
                                                                        setCvData({ ...cvData, experience: newExp })
                                                                    }}
                                                                    placeholder="Jan 2020"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">End Date</Label>
                                                                <Input
                                                                    value={exp.endDate}
                                                                    onChange={e => {
                                                                        const newExp = [...cvData.experience]
                                                                        newExp[index].endDate = e.target.value
                                                                        setCvData({ ...cvData, experience: newExp })
                                                                    }}
                                                                    placeholder="Present"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">Location</Label>
                                                                <Input
                                                                    value={exp.location}
                                                                    onChange={e => {
                                                                        const newExp = [...cvData.experience]
                                                                        newExp[index].location = e.target.value
                                                                        setCvData({ ...cvData, experience: newExp })
                                                                    }}
                                                                    placeholder="City, State"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="flex justify-between items-center mb-1">
                                                                <Label className="text-xs">Description</Label>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-6"
                                                                    onClick={() => openAIDialog('experience', index)}
                                                                >
                                                                    <Wand2 className="w-3 h-3 mr-1" />
                                                                    AI Suggest
                                                                </Button>
                                                            </div>
                                                            <Textarea
                                                                className="min-h-[120px] text-sm"
                                                                value={exp.description}
                                                                onChange={e => {
                                                                    const newExp = [...cvData.experience]
                                                                    newExp[index].description = e.target.value
                                                                    setCvData({ ...cvData, experience: newExp })
                                                                }}
                                                                placeholder="• Led team of 5 developers...&#10;• Increased performance by 40%..."
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}

                                            {cvData.experience.length === 0 && (
                                                <div className="text-center text-muted-foreground py-8">
                                                    {translate('noExperienceYet')}
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="education" className="mt-0 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base">Education</Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setCvData({
                                                    ...cvData,
                                                    education: [...cvData.education, {
                                                        institution: '',
                                                        degree: '',
                                                        field: '',
                                                        startDate: '',
                                                        endDate: '',
                                                        location: '',
                                                        gpa: '',
                                                        description: ''
                                                    }]
                                                })
                                            }}
                                        >
                                            {translate('addEducation')}
                                        </Button>
                                    </div>

                                    <ScrollArea className="h-[500px]">
                                        <div className="space-y-4 pr-4">
                                            {cvData.education.map((edu, index) => (
                                                <Card key={index}>
                                                    <CardContent className="pt-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <Label className="text-sm font-semibold">{tNav('educationNumber', { number: index + 1 })}</Label>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newEdu = cvData.education.filter((_, i) => i !== index)
                                                                    setCvData({ ...cvData, education: newEdu })
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label className="text-xs">{translate('institution')}</Label>
                                                                <Input
                                                                    value={edu.institution}
                                                                    onChange={e => {
                                                                        const newEdu = [...cvData.education]
                                                                        newEdu[index].institution = e.target.value
                                                                        setCvData({ ...cvData, education: newEdu })
                                                                    }}
                                                                    placeholder="University name"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">{translate('degree')}</Label>
                                                                <Input
                                                                    value={edu.degree}
                                                                    onChange={e => {
                                                                        const newEdu = [...cvData.education]
                                                                        newEdu[index].degree = e.target.value
                                                                        setCvData({ ...cvData, education: newEdu })
                                                                    }}
                                                                    placeholder="Bachelor's, Master's..."
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label className="text-xs">{translate('field')}</Label>
                                                                <Input
                                                                    value={edu.field}
                                                                    onChange={e => {
                                                                        const newEdu = [...cvData.education]
                                                                        newEdu[index].field = e.target.value
                                                                        setCvData({ ...cvData, education: newEdu })
                                                                    }}
                                                                    placeholder="Computer Science"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">{translate('gpa')}</Label>
                                                                <Input
                                                                    value={edu.gpa}
                                                                    onChange={e => {
                                                                        const newEdu = [...cvData.education]
                                                                        newEdu[index].gpa = e.target.value
                                                                        setCvData({ ...cvData, education: newEdu })
                                                                    }}
                                                                    placeholder="3.8/4.0"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <Label className="text-xs">Start Date</Label>
                                                                <Input
                                                                    value={edu.startDate}
                                                                    onChange={e => {
                                                                        const newEdu = [...cvData.education]
                                                                        newEdu[index].startDate = e.target.value
                                                                        setCvData({ ...cvData, education: newEdu })
                                                                    }}
                                                                    placeholder="Sep 2018"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">End Date</Label>
                                                                <Input
                                                                    value={edu.endDate}
                                                                    onChange={e => {
                                                                        const newEdu = [...cvData.education]
                                                                        newEdu[index].endDate = e.target.value
                                                                        setCvData({ ...cvData, education: newEdu })
                                                                    }}
                                                                    placeholder="Jun 2022"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">Location</Label>
                                                                <Input
                                                                    value={edu.location}
                                                                    onChange={e => {
                                                                        const newEdu = [...cvData.education]
                                                                        newEdu[index].location = e.target.value
                                                                        setCvData({ ...cvData, education: newEdu })
                                                                    }}
                                                                    placeholder="City, State"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="flex justify-between items-center mb-1">
                                                                <Label className="text-xs">Description (Optional)</Label>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-6"
                                                                    onClick={() => handleMagicWrite('education', {
                                                                        degree: edu.degree,
                                                                        field: edu.field,
                                                                        institution: edu.institution
                                                                    }, index)}
                                                                    disabled={!!generating}
                                                                >
                                                                    {generating === `education-${index}` ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                                    ) : (
                                                                        <Wand2 className="w-3 h-3 mr-1" />
                                                                    )}
                                                                    AI Suggest
                                                                </Button>
                                                            </div>
                                                            <Textarea
                                                                className="min-h-[100px] text-sm"
                                                                value={edu.description}
                                                                onChange={e => {
                                                                    const newEdu = [...cvData.education]
                                                                    newEdu[index].description = e.target.value
                                                                    setCvData({ ...cvData, education: newEdu })
                                                                }}
                                                                placeholder="Relevant coursework, honors, activities..."
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}

                                            {cvData.education.length === 0 && (
                                                <div className="text-center text-muted-foreground py-8">
                                                    {translate('noEducationYet')}
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="skills" className="mt-0 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base">{translate('skills')}</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                            onClick={() => openAIDialog('skills')}
                                        >
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            {translate('magicButton')}
                                        </Button>
                                    </div>
                                    <Textarea
                                        className="min-h-[200px]"
                                        placeholder={t('skillsPlaceholder')}
                                        value={cvData.skills}
                                        onChange={e => setCvData({ ...cvData, skills: e.target.value })}
                                    />
                                </TabsContent>

                                <TabsContent value="projects" className="mt-0 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base">{translate('projects')}</Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setCvData({
                                                    ...cvData,
                                                    projects: [...cvData.projects, {
                                                        name: '',
                                                        description: '',
                                                        role: '',
                                                        startDate: '',
                                                        endDate: '',
                                                        githubLink: '',
                                                        technologies: ''
                                                    }]
                                                })
                                            }}
                                        >
                                            {translate('addProject')}
                                        </Button>
                                    </div>

                                    <ScrollArea className="h-[500px]">
                                        <div className="space-y-4 pr-4">
                                            {cvData.projects.map((proj, index) => (
                                                <Card key={index}>
                                                    <CardContent className="pt-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <Label className="text-sm font-semibold">{tNav('projectNumber', { number: index + 1 })}</Label>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newProj = cvData.projects.filter((_, i) => i !== index)
                                                                    setCvData({ ...cvData, projects: newProj })
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <Label className="text-xs">{translate('projectName')}</Label>
                                                                <Input
                                                                    value={proj.name}
                                                                    onChange={e => {
                                                                        const newProj = [...cvData.projects]
                                                                        newProj[index].name = e.target.value
                                                                        setCvData({ ...cvData, projects: newProj })
                                                                    }}
                                                                    placeholder="AI Career Mentor"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">{translate('yourRole')}</Label>
                                                                <Input
                                                                    value={proj.role}
                                                                    onChange={e => {
                                                                        const newProj = [...cvData.projects]
                                                                        newProj[index].role = e.target.value
                                                                        setCvData({ ...cvData, projects: newProj })
                                                                    }}
                                                                    placeholder="Full-stack Developer"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <Label className="text-xs">Start Date</Label>
                                                                <Input
                                                                    value={proj.startDate}
                                                                    onChange={e => {
                                                                        const newProj = [...cvData.projects]
                                                                        newProj[index].startDate = e.target.value
                                                                        setCvData({ ...cvData, projects: newProj })
                                                                    }}
                                                                    placeholder="Jan 2024"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">End Date</Label>
                                                                <Input
                                                                    value={proj.endDate}
                                                                    onChange={e => {
                                                                        const newProj = [...cvData.projects]
                                                                        newProj[index].endDate = e.target.value
                                                                        setCvData({ ...cvData, projects: newProj })
                                                                    }}
                                                                    placeholder="Ongoing"
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">{translate('githubLink')}</Label>
                                                                <Input
                                                                    value={proj.githubLink}
                                                                    onChange={e => {
                                                                        const newProj = [...cvData.projects]
                                                                        newProj[index].githubLink = e.target.value
                                                                        setCvData({ ...cvData, projects: newProj })
                                                                    }}
                                                                    placeholder="github.com/user/repo"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <Label className="text-xs">{translate('technologies')}</Label>
                                                            <Input
                                                                value={proj.technologies}
                                                                onChange={e => {
                                                                    const newProj = [...cvData.projects]
                                                                    newProj[index].technologies = e.target.value
                                                                    setCvData({ ...cvData, projects: newProj })
                                                                }}
                                                                placeholder="React, TypeScript, Node.js"
                                                            />
                                                        </div>

                                                        <div>
                                                            <div className="flex justify-between items-center mb-1">
                                                                <Label className="text-xs">Description</Label>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-6"
                                                                    onClick={() => openAIDialog('project', index)}
                                                                >
                                                                    <Wand2 className="w-3 h-3 mr-1" />
                                                                    AI Suggest
                                                                </Button>
                                                            </div>
                                                            <Textarea
                                                                className="min-h-[120px] text-sm"
                                                                value={proj.description}
                                                                onChange={e => {
                                                                    const newProj = [...cvData.projects]
                                                                    newProj[index].description = e.target.value
                                                                    setCvData({ ...cvData, projects: newProj })
                                                                }}
                                                                placeholder="Built AI-powered career mentorship platform...&#10;• Key features and achievements..."
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}

                                            {cvData.projects.length === 0 && (
                                                <div className="text-center text-muted-foreground py-8">
                                                    {translate('noProjectsYet')}
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </div>

                {/* Right: Preview */}
                <div className="w-1/2 bg-slate-100 overflow-hidden relative">
                    <CVPreview data={cvData} template={activeTemplate as 'harvard' | 'modern' | 'creative'} />
                </div>
            </div>

            {/* AI Context Dialog */}
            <AIContextDialog
                open={aiDialogOpen}
                onOpenChange={setAiDialogOpen}
                section={aiDialogSection}
                onGenerate={handleAIGenerate}
                loading={!!generating}
            />
        </div>
    )
}
