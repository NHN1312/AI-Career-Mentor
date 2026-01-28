import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const { role, seniority, locale } = await req.json()

        if (!role) {
            return NextResponse.json({ error: 'Missing role' }, { status: 400 })
        }

        const seniorityText = seniority ? ` for a ${seniority} level` : '';
        const languageInstruction = locale === 'vi' ? 'Respond in Vietnamese (Tiếng Việt).' : 'Respond in English.';

        const { text } = await generateText({
            model: google('models/gemini-2.5-flash'),
            prompt: `Generate a common interview question for a ${role} position${seniorityText}.
            ${languageInstruction}

The question should be:
- Relevant to the role
- Commonly asked in interviews
- Tests both technical and behavioral aspects

Return as JSON:
{
  "question": "<the interview question>"
}

Return ONLY the JSON object, no markdown or other text.`,
        })

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response')
        }

        return NextResponse.json(JSON.parse(jsonMatch[0]))
    } catch (error) {
        console.error('Question generation error:', error)
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }
}
