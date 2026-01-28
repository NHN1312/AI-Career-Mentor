'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Home, Loader2, TrendingUp } from 'lucide-react'

type CareerPath = {
    overview: string
    milestones: Array<{
        title: string
        timeframe: string
        keySkills: string[]
        actions: string[]
    }>
    longTermGoal: string
}

export default function CareerPathPage() {
    const [currentRole, setCurrentRole] = useState('')
    const [goalRole, setGoalRole] = useState('')
    const [experience, setExperience] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [result, setResult] = useState<CareerPath | null>(null)
    const [error, setError] = useState('')

    const handleGenerate = async () => {
        if (!currentRole.trim() || !goalRole.trim()) {
            setError('Please fill in all required fields')
            return
        }

        setIsGenerating(true)
        setError('')

        try {
            const response = await fetch('/api/career-path/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentRole, goalRole, experience }),
            })

            if (!response.ok) throw new Error('Generation failed')

            const data = await response.json()
            setResult(data)
        } catch (err) {
            setError('Failed to generate career path. Please try again.')
        } finally {
            setIsGenerating(false)
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
                    <span className="text-foreground">Career Path Planning</span>
                </div>
                <h1 className="text-3xl font-bold">Career Path Planning</h1>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Generate Your Career Roadmap
                    </CardTitle>
                    <CardDescription>
                        Get a personalized career progression plan with milestones and timelines
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="currentRole">Current Role *</Label>
                        <Input
                            id="currentRole"
                            placeholder="e.g., Junior Developer, Marketing Specialist"
                            value={currentRole}
                            onChange={(e) => setCurrentRole(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>

                    <div>
                        <Label htmlFor="goalRole">Goal Role *</Label>
                        <Input
                            id="goalRole"
                            placeholder="e.g., Engineering Manager, VP of Marketing"
                            value={goalRole}
                            onChange={(e) => setGoalRole(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>

                    <div>
                        <Label htmlFor="experience">Years of Experience (Optional)</Label>
                        <Input
                            id="experience"
                            placeholder="e.g., 3 years"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>

                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate Career Path'
                        )}
                    </Button>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Career Progression Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{result.overview}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Career Milestones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {result.milestones.map((milestone, i) => (
                                    <div key={i} className="relative pl-8 pb-8 border-l-2 border-primary last:border-0 last:pb-0">
                                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">{milestone.title}</h3>
                                            <p className="text-sm text-muted-foreground">{milestone.timeframe}</p>

                                            <div>
                                                <p className="text-sm font-medium mt-3">Key Skills:</p>
                                                <ul className="text-sm list-disc list-inside">
                                                    {milestone.keySkills.map((skill, j) => (
                                                        <li key={j}>{skill}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium mt-3">Action Items:</p>
                                                <ul className="text-sm list-disc list-inside">
                                                    {milestone.actions.map((action, j) => (
                                                        <li key={j}>{action}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Long-Term Vision</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">{result.longTermGoal}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
