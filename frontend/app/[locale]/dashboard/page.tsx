'use client'

import { ChatInterface } from "@/components/chat-interface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { FileText, MessageSquare, Target, TrendingUp, MessageCircle } from "lucide-react"
import { useTranslations } from 'next-intl'

export default function DashboardPage() {
    const t = useTranslations('Dashboard')

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Chat Interface Card */}
                <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-blue-500" />
                            </div>
                            <CardTitle>{t('aiCareerChat')}</CardTitle>
                        </div>
                    </CardHeader>
                </Card>

                {/* Resume Analyzer Card */}
                <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <FileText className="w-6 h-6 text-green-500" />
                            </div>
                            <CardTitle>{t('resumeAnalyzer')}</CardTitle>
                        </div>
                        <CardDescription>
                            {t('resumeAnalyzerDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/dashboard/resume">{t('analyzeResume')}</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Skill Gap Analysis Card */}
                <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Target className="w-6 h-6 text-purple-500" />
                            </div>
                            <CardTitle>{t('skillGapAnalysis')}</CardTitle>
                        </div>
                        <CardDescription>
                            {t('skillGapAnalysisDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/dashboard/skill-gap">{t('analyzeSkills')}</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* CV Improvement Studio Card */}
                <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-orange-500" />
                            </div>
                            <CardTitle>{t('aiCvMaker')}</CardTitle>
                        </div>
                        <CardDescription>
                            {t('aiCvMakerDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/dashboard/cv-improve">{t('goToCvMaker')}</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Interview Prep Card */}
                <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-500/10 rounded-lg">
                                <MessageCircle className="w-6 h-6 text-pink-500" />
                            </div>
                            <CardTitle>{t('interviewPrep')}</CardTitle>
                        </div>
                        <CardDescription>
                            {t('interviewPrepDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/dashboard/interview-prep">{t('startPractice')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6">
                <ChatInterface />
            </div>
        </div>
    )
}
