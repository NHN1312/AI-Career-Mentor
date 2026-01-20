'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Home, Loader2, Target } from 'lucide-react'

type AnalysisResult = {
    currentLevel: string
    missingSkills: string[]
    learningRoadmap: Array<{
        skill: string
        priority: string
        resources: string[]
    }>
    timeEstimate: string
}

export default function SkillGapPage() {
    const [targetRole, setTargetRole] = useState('')
    const [currentSkills, setCurrentSkills] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [error, setError] = useState('')
    const [loadingProfile, setLoadingProfile] = useState(true)

    // Fetch user profile and auto-fill skills
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile')
                if (res.ok) {
                    const data = await res.json()

                    // Auto-fill current role as target role suggestion
                    if (data.profile?.current_role) {
                        // Don't auto-fill, but could use as placeholder
                    }

                    // Auto-fill skills
                    if (data.skills?.length > 0) {
                        const skillsText = data.skills
                            .map((s: any) => `${s.skill_name} (${s.skill_category})`)
                            .join(', ')
                        setCurrentSkills(skillsText)
                    }
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err)
            } finally {
                setLoadingProfile(false)
            }
        }

        fetchProfile()
    }, [])

    const handleAnalyze = async () => {
        if (!targetRole.trim() || !currentSkills.trim()) {
            setError('Please fill in all fields')
            return
        }

        setIsAnalyzing(true)
        setError('')

        try {
            const response = await fetch('/api/skill-gap/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetRole, currentSkills }),
            })

            if (!response.ok) throw new Error('Analysis failed')

            const data = await response.json()
            setResult(data)
        } catch (err) {
            setError('Failed to analyze skills. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">Skill Gap Analysis</span>
                </div>
                <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Analyze Your Skills
                    </CardTitle>
                    <CardDescription>
                        {loadingProfile
                            ? 'Loading your profile...'
                            : 'Your skills have been auto-filled from your CV. Enter your target role to analyze.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="targetRole">Target Role</Label>
                        <Input
                            id="targetRole"
                            placeholder="e.g., Senior Software Engineer, Data Scientist"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            disabled={isAnalyzing}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentSkills">Current Skills</Label>
                        <Textarea
                            id="currentSkills"
                            placeholder="List your current skills, experience, and expertise..."
                            value={currentSkills}
                            onChange={(e) => setCurrentSkills(e.target.value)}
                            disabled={isAnalyzing || loadingProfile}
                            rows={6}
                        />
                    </div>

                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            'Analyze Skill Gap'
                        )}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Level Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{result.currentLevel}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-orange-600">Missing Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2">
                                {result.missingSkills.map((skill, i) => (
                                    <li key={i}>{skill}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-green-600">Learning Roadmap</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.learningRoadmap.map((item, i) => (
                                <div key={i} className="border-l-4 border-primary pl-4">
                                    <h3 className="font-semibold">{item.skill}</h3>
                                    <p className="text-sm text-muted-foreground">Priority: {item.priority}</p>
                                    <ul className="text-sm mt-2 space-y-1">
                                        {item.resources.map((resource, j) => (
                                            <li key={j}>• {resource}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Estimated Learning Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-primary">{result.timeEstimate}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
