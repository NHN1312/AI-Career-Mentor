import { ChatInterface } from "@/components/chat-interface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, MessageSquare, Target, TrendingUp, MessageCircle } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Chat Interface Card */}
                <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-blue-500" />
                            </div>
                            <CardTitle>AI Career Chat</CardTitle>
                        </div>
                        <CardDescription>
                            Get personalized career advice
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Ask questions about your career path and get instant AI guidance.
                        </p>
                    </CardContent>
                </Card>

                {/* Resume Analyzer Card */}
                <Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <FileText className="w-6 h-6 text-green-500" />
                            </div>
                            <CardTitle>Resume Analyzer</CardTitle>
                        </div>
                        <CardDescription>
                            AI-powered CV optimization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Get detailed feedback with scores and improvement tips.
                        </p>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/dashboard/resume">Analyze Resume</Link>
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
                            <CardTitle>Skill Gap Analysis</CardTitle>
                        </div>
                        <CardDescription>
                            Identify missing skills
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Compare your skills with target roles and get a learning roadmap.
                        </p>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/dashboard/skill-gap">Analyze Skills</Link>
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
                            <CardTitle>CV Improvement Studio</CardTitle>
                        </div>
                        <CardDescription>
                            Edit and improve your CV
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Edit CV sections with AI suggestions based on your analysis.
                        </p>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/dashboard/cv-improve">Improve CV</Link>
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
                            <CardTitle>Interview Prep</CardTitle>
                        </div>
                        <CardDescription>
                            AI mock interviews
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Practice common questions and get AI feedback on answers.
                        </p>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/dashboard/interview-prep">Start Practice</Link>
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
