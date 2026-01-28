'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Loader2 } from 'lucide-react'

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile')
            if (res.ok) {
                const data = await res.json()
                setProfile(data)
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="container mx-auto p-6">
                <p>No profile data found. Upload your resume to get started!</p>
            </div>
        )
    }

    const skillsByCategory = profile.skills?.reduce((acc: any, skill: any) => {
        const category = skill.skill_category || 'other'
        if (!acc[category]) acc[category] = []
        acc[category].push(skill)
        return acc
    }, {})

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Link href="/dashboard" className="hover:text-foreground flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">My Profile</span>
                </div>
                <h1 className="text-3xl font-bold">My Profile</h1>
            </div>

            <div className="space-y-6">
                {/* Profile Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {profile.profile?.current_role && (
                            <div>
                                <span className="font-semibold">Current Role:</span> {profile.profile.current_role}
                            </div>
                        )}
                        {profile.profile?.years_of_experience !== null && (
                            <div>
                                <span className="font-semibold">Experience:</span> {profile.profile.years_of_experience} years
                            </div>
                        )}
                        {profile.profile?.summary && (
                            <div>
                                <span className="font-semibold">Summary:</span>
                                <p className="mt-2 text-muted-foreground">{profile.profile.summary}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Skills */}
                {profile.skills?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills ({profile.skills.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(skillsByCategory).map(([category, skills]: [string, any]) => (
                                <div key={category}>
                                    <h3 className="font-semibold capitalize mb-2">{category.replace('_', ' ')}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill: any) => (
                                            <Badge key={skill.id} variant="secondary">
                                                {skill.skill_name}
                                                {skill.proficiency_level && ` (${skill.proficiency_level})`}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Education */}
                {profile.education?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Education</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {profile.education.map((edu: any) => (
                                <div key={edu.id} className="border-l-2 border-primary pl-4">
                                    <h3 className="font-semibold">{edu.degree}</h3>
                                    <p className="text-muted-foreground">{edu.institution}</p>
                                    {edu.field_of_study && <p className="text-sm">{edu.field_of_study}</p>}
                                    {(edu.start_date || edu.end_date) && (
                                        <p className="text-sm text-muted-foreground">
                                            {edu.start_date} - {edu.end_date || 'Present'}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Certifications */}
                {profile.certifications?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Certifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {profile.certifications.map((cert: any) => (
                                <div key={cert.id}>
                                    <h3 className="font-semibold">{cert.certification_name}</h3>
                                    {cert.issuing_organization && (
                                        <p className="text-sm text-muted-foreground">{cert.issuing_organization}</p>
                                    )}
                                    {cert.issue_date && (
                                        <p className="text-sm text-muted-foreground">Issued: {cert.issue_date}</p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Work Experience */}
                {profile.workExperience?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Work Experience</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {profile.workExperience.map((exp: any) => (
                                <div key={exp.id} className="border-l-2 border-primary pl-4">
                                    <h3 className="font-semibold">{exp.position}</h3>
                                    <p className="text-muted-foreground">{exp.company}</p>
                                    {(exp.start_date || exp.end_date) && (
                                        <p className="text-sm text-muted-foreground">
                                            {exp.start_date} - {exp.end_date || 'Present'}
                                        </p>
                                    )}
                                    {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Resume Analysis History */}
                {profile.analyses?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Resume Analysis History</CardTitle>
                            <CardDescription>Your recent CV uploads</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {profile.analyses.map((analysis: any) => (
                                <div key={analysis.id} className="border rounded p-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{analysis.file_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(analysis.analyzed_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge variant={analysis.score >= 80 ? 'default' : 'secondary'}>
                                            Score: {analysis.score}/100
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
