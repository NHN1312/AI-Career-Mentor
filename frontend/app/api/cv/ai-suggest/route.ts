import { NextRequest, NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { section, context } = body

        if (!section || !context) {
            return NextResponse.json(
                { error: 'Section and context are required' },
                { status: 400 }
            )
        }

        const prompt = buildPrompt(section, context)

        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: prompt,
        })

        return NextResponse.json({ suggestion: text })
    } catch (error) {
        console.error('AI suggestion error:', error)
        return NextResponse.json(
            { error: 'Failed to generate suggestion' },
            { status: 500 }
        )
    }
}

function buildPrompt(section: string, context: Record<string, any>): string {
    switch (section) {
        case 'summary':
            return buildSummaryPrompt(context)
        case 'experience':
            return buildExperiencePrompt(context)
        case 'project':
            return buildProjectPrompt(context)
        case 'skills':
            return buildSkillsPrompt(context)
        default:
            return ''
    }
}

function buildSummaryPrompt(context: Record<string, any>): string {
    const { jobTitle, experience, skills, industry } = context

    return `You are a professional CV writer. Generate a compelling professional summary for a CV.

Context:
- Target position: ${jobTitle}
- Years of experience: ${experience}
${skills ? `- Key skills: ${skills}` : ''}
${industry ? `- Industry: ${industry}` : ''}

Requirements:
1. Write 3-4 sentences (60-80 words)
2. Highlight relevant experience and skills
3. Focus on value proposition
4. Use action-oriented language
5. Tailor to the target position
6. Be professional and confident

Generate ONLY the summary text, no additional formatting or explanation.`
}

function buildExperiencePrompt(context: Record<string, any>): string {
    const { role, responsibilities, achievements, technologies } = context

    return `You are a professional CV writer. Generate compelling bullet points for a work experience entry.

Context:
- Role/Position: ${role}
${responsibilities ? `- Responsibilities: ${responsibilities}` : ''}
${achievements ? `- Key achievements: ${achievements}` : ''}
${technologies ? `- Technologies/Tools: ${technologies}` : ''}

Requirements:
1. Generate 4-6 bullet points
2. Start each with strong action verbs (Led, Developed, Implemented, etc.)
3. Include quantifiable results when possible
4. Highlight impact and achievements, not just duties
5. Mention relevant technologies/tools
6. Use past tense for completed roles
7. Be specific and concrete

Generate ONLY the bullet points (one per line with • or -), no additional text or explanation.`
}

function buildProjectPrompt(context: Record<string, any>): string {
    const { role, projectType, technologies, outcomes } = context

    return `You are a professional CV writer. Generate a compelling description for a project entry.

Context:
- Your role: ${role}
${projectType ? `- Project type: ${projectType}` : ''}
${technologies ? `- Technologies used: ${technologies}` : ''}
${outcomes ? `- Key outcomes: ${outcomes}` : ''}

Requirements:
1. Generate 3-5 bullet points
2. Start with your role and contribution
3. Highlight technical approach and technologies
4. Emphasize outcomes and impact
5. Be specific about your contributions
6. Include metrics or results if available

Generate ONLY the bullet points (one per line with • or -), no additional text or explanation.`
}

function buildSkillsPrompt(context: Record<string, any>): string {
    const { industry, level, focus } = context

    return `You are a professional CV writer. Generate a comprehensive skills list for a CV.

Context:
- Industry/Domain: ${industry}
${level ? `- Experience level: ${level}` : ''}
${focus ? `- Focus areas: ${focus}` : ''}

Requirements:
1. Generate 15-20 relevant skills
2. Organize by categories (e.g., Technical Skills, Tools & Platforms, Soft Skills)
3. Include both technical and soft skills appropriate for the industry
4. Prioritize most relevant and in-demand skills
5. Be specific (e.g., "React.js" not just "Frontend")
6. Consider current industry trends

Format output as:
**Category Name:**
Skill1, Skill2, Skill3, ...

**Another Category:**
Skill1, Skill2, Skill3, ...

Generate ONLY the categorized skills list, no additional explanation.`
}
