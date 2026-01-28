import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { targetRole, currentSkills, locale } = await req.json()

    if (!targetRole || !currentSkills) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const languageInstruction = locale === 'vi' ? 'Respond in Vietnamese (Tiếng Việt) where applicable (e.g., analysis, roadmap).' : 'Respond in English.';

    const { text } = await generateText({
      model: google('models/gemini-2.5-flash'),
      prompt: `Analyze the skill gap for someone wanting to become a ${targetRole}.

Current Skills:
${currentSkills}

Provide your analysis in this exact JSON structure:
{
  "currentLevel": "<assessment of current skill level>",
  "missingSkills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "learningRoadmap": [
    {
      "skill": "<skill name>",
      "priority": "<High/Medium/Low>",
      "resources": ["<resource 1>", "<resource 2>", "<resource 3>"]
    }
  ],
  "timeEstimate": "<estimated time to acquire missing skills>"
}

Focus on:
- Most critical skills needed for ${targetRole}
- Realistic learning resources (courses, books, projects)
- Prioritized learning path
- Practical time estimates

${languageInstruction}

Return ONLY the JSON object, no markdown or other text.`,
    })

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error) {
    console.error('Skill gap analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
