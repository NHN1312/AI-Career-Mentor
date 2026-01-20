import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        // Fetch skills
        const { data: skills } = await supabase
            .from('user_skills')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        // Fetch education
        const { data: education } = await supabase
            .from('user_education')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false })

        // Fetch certifications
        const { data: certifications } = await supabase
            .from('user_certifications')
            .select('*')
            .eq('user_id', user.id)
            .order('issue_date', { ascending: false })

        // Fetch work experience
        const { data: workExperience } = await supabase
            .from('user_work_experience')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false })

        // Fetch resume analyses history
        const { data: analyses } = await supabase
            .from('resume_analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('analyzed_at', { ascending: false })
            .limit(10)

        return NextResponse.json({
            profile: {
                id: profile?.id,
                email: user.email,
                current_role: profile?.current_role,
                years_of_experience: profile?.years_of_experience,
                summary: profile?.summary,
            },
            skills: skills || [],
            education: education || [],
            certifications: certifications || [],
            workExperience: workExperience || [],
            analyses: analyses || [],
        })
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
}
