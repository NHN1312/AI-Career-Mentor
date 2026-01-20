'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, Loader2, FileText, Lightbulb, Download } from 'lucide-react'

export default function CVImprovementPage() {
    const [loading, setLoading] = useState(true)
    const [weaknesses, setWeaknesses] = useState<string[]>([])
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [cvData, setCvData] = useState({
        summary: '',
        skills: '',
        experience: '',
    })

    useEffect(() => {
        fetchCVData()
    }, [])

    const fetchCVData = async () => {
        try {
            const profileRes = await fetch('/api/profile')
            if (profileRes.ok) {
                const profile = await profileRes.json()

                // Load existing data
                setCvData({
                    summary: profile.profile?.summary || '',
                    skills: profile.skills?.map((s: any) => s.skill_name).join(', ') || '',
                    experience: profile.workExperience?.map((e: any) =>
                        `${e.position} at ${e.company}\n${e.description || ''}`
                    ).join('\n\n') || '',
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
                        Dashboard
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">CV Improvement Studio</span>
                </div>
                <h1 className="text-3xl font-bold">CV Improvement Studio</h1>
                <p className="text-muted-foreground mt-2">
                    Improve your CV based on AI analysis and suggestions
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Professional Summary */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Professional Summary</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleGetAISuggestion('summary')}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    AI Suggestion
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={cvData.summary}
                                onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                                rows={6}
                                placeholder="Write a compelling professional summary..."
                            />
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Skills</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleGetAISuggestion('skills')}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    AI Suggestion
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={cvData.skills}
                                onChange={(e) => setCvData({ ...cvData, skills: e.target.value })}
                                rows={4}
                                placeholder="List your skills..."
                            />
                        </CardContent>
                    </Card>

                    {/* Work Experience */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Work Experience</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleGetAISuggestion('experience')}
                                >
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    AI Suggestion
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={cvData.experience}
                                onChange={(e) => setCvData({ ...cvData, experience: e.target.value })}
                                rows={12}
                                placeholder="Describe your work experience with achievements and impact..."
                            />
                        </CardContent>
                    </Card>

                    <Button className="w-full" size="lg">
                        <Download className="w-4 h-4 mr-2" />
                        Export CV (Coming Soon)
                    </Button>
                </div>

                {/* Sidebar - Weaknesses & Suggestions */}
                <div className="space-y-6">
                    {/* Identified Weaknesses */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">⚠️ Areas to Improve</CardTitle>
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
                                    Upload a CV to see improvement areas
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Suggestions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">💡 Suggestions</CardTitle>
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
                                    No suggestions yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
