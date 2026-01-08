import { ChatInterface } from "@/components/chat-interface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, MessageSquare } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            AI Career Mentor Chat
                        </CardTitle>
                        <CardDescription>
                            Get personalized career advice, interview tips, and guidance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Ask questions about your career path, interview preparation, or job search strategies.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Resume Analyzer
                        </CardTitle>
                        <CardDescription>
                            Upload your resume for AI-powered analysis and feedback
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Get detailed feedback on your resume with strengths, weaknesses, and improvement suggestions.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/dashboard/resume">Analyze Resume</Link>
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
