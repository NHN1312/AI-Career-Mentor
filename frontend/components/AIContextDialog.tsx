'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

type SectionType = 'summary' | 'experience' | 'project' | 'skills'

interface AIContextDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    section: SectionType
    onGenerate: (context: Record<string, any>) => Promise<void>
    loading?: boolean
}

export function AIContextDialog({
    open,
    onOpenChange,
    section,
    onGenerate,
    loading = false
}: AIContextDialogProps) {
    const t = useTranslations('AIContext')

    // Form state
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [error, setError] = useState<string>('')

    // Clear error when dialog opens
    useEffect(() => {
        if (open) {
            setError('')
        }
    }, [open])

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
        setError('')
    }

    const handleGenerate = async () => {
        // Validate required fields
        const requiredFields = getRequiredFields(section)
        const missingFields = requiredFields.filter(field => !formData[field]?.trim())

        if (missingFields.length > 0) {
            setError(t('pleaseFillRequired'))
            return
        }

        try {
            await onGenerate(formData)
            // Reset form on success
            setFormData({})
            onOpenChange(false)
        } catch (err) {
            setError(t('generationFailed'))
        }
    }

    const getRequiredFields = (section: SectionType): string[] => {
        switch (section) {
            case 'summary':
                return ['jobTitle', 'experience']
            case 'experience':
            case 'project':
                return ['role']
            case 'skills':
                return ['industry']
            default:
                return []
        }
    }

    const renderFormFields = () => {
        switch (section) {
            case 'summary':
                return (
                    <>
                        <div className="space-y-3">
                            <Label htmlFor="jobTitle" className="text-sm font-medium">{t('summary.jobTitle')} *</Label>
                            <Input
                                id="jobTitle"
                                placeholder={t('summary.jobTitlePlaceholder')}
                                value={formData.jobTitle || ''}
                                onChange={(e) => handleChange('jobTitle', e.target.value)}
                                disabled={loading}
                                className="h-12 px-4 shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="experience" className="text-sm font-medium">{t('summary.yearsExperience')} *</Label>
                            <Input
                                id="experience"
                                placeholder={t('summary.yearsPlaceholder')}
                                value={formData.experience || ''}
                                onChange={(e) => handleChange('experience', e.target.value)}
                                disabled={loading}
                                className="h-12 px-4 shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="skills" className="text-sm font-medium">{t('summary.keySkills')}</Label>
                            <Textarea
                                id="skills"
                                placeholder={t('summary.skillsPlaceholder')}
                                value={formData.skills || ''}
                                onChange={(e) => handleChange('skills', e.target.value)}
                                disabled={loading}
                                rows={3}
                                className="resize-none px-4 py-3 text-base leading-relaxed shadow-sm min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="industry" className="text-sm font-medium">{t('summary.industry')}</Label>
                            <Input
                                id="industry"
                                placeholder={t('summary.industryPlaceholder')}
                                value={formData.industry || ''}
                                onChange={(e) => handleChange('industry', e.target.value)}
                                disabled={loading}
                                className="h-12 px-4 shadow-sm"
                            />
                        </div>
                    </>
                )

            case 'experience':
                return (
                    <>
                        <div className="space-y-3">
                            <Label htmlFor="role" className="text-sm font-medium">{t('experience.role')} *</Label>
                            <Input
                                id="role"
                                placeholder={t('experience.rolePlaceholder')}
                                value={formData.role || ''}
                                onChange={(e) => handleChange('role', e.target.value)}
                                disabled={loading}
                                className="h-12 px-4 shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="responsibilities" className="text-sm font-medium">{t('experience.responsibilities')}</Label>
                            <Textarea
                                id="responsibilities"
                                placeholder={t('experience.responsibilitiesPlaceholder')}
                                value={formData.responsibilities || ''}
                                onChange={(e) => handleChange('responsibilities', e.target.value)}
                                disabled={loading}
                                rows={3}
                                className="resize-none px-4 py-3 text-base leading-relaxed shadow-sm min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="achievements" className="text-sm font-medium">{t('experience.achievements')}</Label>
                            <Textarea
                                id="achievements"
                                placeholder={t('experience.achievementsPlaceholder')}
                                value={formData.achievements || ''}
                                onChange={(e) => handleChange('achievements', e.target.value)}
                                disabled={loading}
                                rows={3}
                                className="resize-none px-4 py-3 text-base leading-relaxed shadow-sm min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="technologies" className="text-sm font-medium">{t('experience.technologies')}</Label>
                            <Input
                                id="technologies"
                                placeholder={t('experience.technologiesPlaceholder')}
                                value={formData.technologies || ''}
                                onChange={(e) => handleChange('technologies', e.target.value)}
                                disabled={loading}
                                className="h-12 px-4 shadow-sm"
                            />
                        </div>
                    </>
                )

            case 'project':
                return (
                    <>
                        <div className="space-y-3">
                            <Label htmlFor="role" className="text-sm font-medium">{t('project.role')} *</Label>
                            <Input
                                id="role"
                                placeholder={t('project.rolePlaceholder')}
                                value={formData.role || ''}
                                onChange={(e) => handleChange('role', e.target.value)}
                                disabled={loading}
                                className="h-12 px-4 shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="projectType" className="text-sm font-medium">{t('project.projectType')}</Label>
                            <Input
                                id="projectType"
                                placeholder={t('project.projectTypePlaceholder')}
                                value={formData.projectType || ''}
                                onChange={(e) => handleChange('projectType', e.target.value)}
                                disabled={loading}
                                className="h-12 px-4 shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="technologies" className="text-sm font-medium">{t('project.technologies')}</Label>
                            <Input
                                id="technologies"
                                placeholder={t('project.technologiesPlaceholder')}
                                value={formData.technologies || ''}
                                onChange={(e) => handleChange('technologies', e.target.value)}
                                disabled={loading}
                                className="h-12 px-4 shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="outcomes" className="text-sm font-medium">{t('project.outcomes')}</Label>
                            <Textarea
                                id="outcomes"
                                placeholder={t('project.outcomesPlaceholder')}
                                value={formData.outcomes || ''}
                                onChange={(e) => handleChange('outcomes', e.target.value)}
                                disabled={loading}
                                rows={3}
                                className="resize-none px-4 py-3 text-base leading-relaxed shadow-sm min-h-[100px]"
                            />
                        </div>
                    </>
                )

            case 'skills':
                return (
                    <>
                        <div className="space-y-3">
                            <Label htmlFor="industry" className="text-sm font-medium">{t('skills.industry')} *</Label>
                            <Input
                                id="industry"
                                placeholder={t('skills.industryPlaceholder')}
                                value={formData.industry || ''}
                                onChange={(e) => handleChange('industry', e.target.value)}
                                disabled={loading}
                                className="h-12 px-4 shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="level" className="text-sm font-medium">{t('skills.level')}</Label>
                            <Input
                                id="level"
                                placeholder={t('skills.levelPlaceholder')}
                                value={formData.level || ''}
                                onChange={(e) => handleChange('level', e.target.value)}
                                disabled={loading}
                                className="h-12 px-4 shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="focus" className="text-sm font-medium">{t('skills.focus')}</Label>
                            <Textarea
                                id="focus"
                                placeholder={t('skills.focusPlaceholder')}
                                value={formData.focus || ''}
                                onChange={(e) => handleChange('focus', e.target.value)}
                                disabled={loading}
                                rows={2}
                                className="resize-none px-4 py-3 text-base leading-relaxed shadow-sm min-h-[80px]"
                            />
                        </div>
                    </>
                )

            default:
                return null
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-[540px]">
                <SheetHeader className="pb-6 border-b space-y-2">
                    <SheetTitle className="text-xl font-semibold">
                        {t(`${section}.title`)}
                    </SheetTitle>
                    <SheetDescription className="text-sm">
                        {t(`${section}.description`)}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-7 py-6 px-6">
                    {renderFormFields()}

                    {error && (
                        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-start gap-3">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-6 border-t">
                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="flex-1"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('generating')}
                                </>
                            ) : (
                                t('generate')
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            size="lg"
                        >
                            {t('cancel')}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
