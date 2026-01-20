import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const { question, answer, role } = await req.json()

        if (!question || !answer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { text } = await generateText({
            model: google('models/gemini-2.5-flash'),
            prompt: `Analyze this interview answer for a ${role || 'professional'} position.

Question: ${question}
Answer: ${answer}

Provide feedback in this exact JSON structure:
{
  "score": <number 1-10>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "betterAnswer": "<a more polished version of the answer>"
}

Focus on:
- Clarity and structure
- Relevance to the question
- Use of specific examples
- Professional communication

Return ONLY the JSON object, no markdown or other text.`,
        })

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response')
        }

        return NextResponse.json(JSON.parse(jsonMatch[0]))
    } catch (error) {
        console.error('Answer analysis error:', error)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }
}
