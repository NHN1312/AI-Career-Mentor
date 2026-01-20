'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Home, Loader2, MessageCircle } from 'lucide-react'

type InterviewFeedback = {
    question: string
    userAnswer: string
    score: number
    strengths: string[]
    improvements: string[]
    betterAnswer: string
}

export default function InterviewPrepPage() {
    const [role, setRole] = useState('')
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
    const [error, setError] = useState('')

    const handleGenerateQuestion = async () => {
        if (!role.trim()) {
            setError('Please enter a role')
            return
        }

        setIsGeneratingQuestion(true)
        setError('')

        try {
            const response = await fetch('/api/interview-prep/question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            })

            if (!response.ok) throw new Error('Failed to generate question')

            const data = await response.json()
            setQuestion(data.question)
            setAnswer('')
            setFeedback(null)
        } catch (err) {
            setError('Failed to generate question. Please try again.')
        } finally {
            setIsGeneratingQuestion(false)
        }
    }

    const handleAnalyzeAnswer = async () => {
        if (!answer.trim()) {
            setError('Please provide your answer')
            return
        }

        setIsAnalyzing(true)
        setError('')

        try {
            const response = await fetch('/api/interview-prep/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, answer, role }),
            })

            if (!response.ok) throw new Error('Analysis failed')

            const data = await response.json()
            setFeedback({ ...data, question, userAnswer: answer })
        } catch (err) {
            setError('Failed to analyze answer. Please try again.')
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
                    <span className="text-foreground">Interview Prep</span>
                </div>
                <h1 className="text-3xl font-bold">Interview Preparation</h1>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Practice Interview Questions
                    </CardTitle>
                    <CardDescription>
                        Get AI-generated questions and feedback on your answers
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="role">Target Role</Label>
                        <div className="flex gap-2">
                            <Input
                                id="role"
                                placeholder="e.g., Software Engineer, Product Manager"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                disabled={isGeneratingQuestion}
                            />
                            <Button onClick={handleGenerateQuestion} disabled={isGeneratingQuestion}>
                                {isGeneratingQuestion ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Generate Question'
                                )}
                            </Button>
                        </div>
                    </div>

                    {question && (
                        <>
                            <Card className="bg-muted">
                                <CardHeader>
                                    <CardTitle className="text-base">Interview Question</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg">{question}</p>
                                </CardContent>
                            </Card>

                            <div>
                                <Label htmlFor="answer">Your Answer</Label>
                                <Textarea
                                    id="answer"
                                    placeholder="Type your answer here..."
                                    value={answer}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
                                    disabled={isAnalyzing}
                                    rows={8}
                                />
                            </div>

                            <Button onClick={handleAnalyzeAnswer} disabled={isAnalyzing} className="w-full">
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    'Get Feedback'
                                )}
                            </Button>
                        </>
                    )}

                    {error && <p className="text-destructive text-sm">{error}</p>}
                </CardContent>
            </Card>

            {feedback && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="text-5xl font-bold text-primary">{feedback.score}/10</div>
                                <div className="flex-1">
                                    <div className="w-full bg-muted rounded-full h-4">
                                        <div
                                            className="bg-primary h-4 rounded-full transition-all"
                                            style={{ width: `${feedback.score * 10}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-green-600">Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2">
                                {feedback.strengths.map((item, i) => (
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
                                {feedback.improvements.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Better Answer Example</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-line">{feedback.betterAnswer}</p>
                        </CardContent>
                    </Card>

                    <Button onClick={handleGenerateQuestion} className="w-full" variant="outline">
                        Practice Another Question
                    </Button>
                </div>
            )}
        </div>
    )
}
