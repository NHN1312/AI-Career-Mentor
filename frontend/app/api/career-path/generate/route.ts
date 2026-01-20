import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: Request) {
    try {
        const { currentRole, goalRole, experience } = await req.json()

        if (!currentRole || !goalRole) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const experienceContext = experience ? `Current experience: ${experience}` : ''

        const { text } = await generateText({
            model: google('models/gemini-2.5-flash'),
            prompt: `Create a detailed career progression plan from ${currentRole} to ${goalRole}.
${experienceContext}

Provide your analysis in this exact JSON structure:
{
  "overview": "<brief overview of the career path>",
  "milestones": [
    {
      "title": "<milestone role/position>",
      "timeframe": "<estimated time to reach this milestone>",
      "keySkills": ["<skill 1>", "<skill 2>", "<skill 3>"],
      "actions": ["<action 1>", "<action 2>", "<action 3>"]
    }
  ],
  "longTermGoal": "<vision for reaching the goal role>"
}

Include 3-5 progressive milestones.
Focus on:
- Realistic progression steps
- Required skills at each stage
- Concrete action items
- Industry-standard timelines

Return ONLY the JSON object, no markdown or other text.`,
        })

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response')
        }

        return NextResponse.json(JSON.parse(jsonMatch[0]))
    } catch (error) {
        console.error('Career path generation error:', error)
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }
}
