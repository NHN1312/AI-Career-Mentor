import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { extractText } from 'unpdf'
import mammoth from 'mammoth'

export const maxDuration = 60

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        let resumeText = ''
        const fileType = file.type
        const arrayBuffer = await file.arrayBuffer()

        // Handle different file types
        if (fileType === 'application/pdf') {
            // PDF files using unpdf
            const result = await extractText(new Uint8Array(arrayBuffer))
            resumeText = Array.isArray(result.text) ? result.text.join('\n') : result.text
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // DOCX files
            const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) })
            resumeText = result.value
        } else if (fileType === 'text/plain') {
            // Text files
            resumeText = await file.text()
        } else if (fileType.startsWith('image/')) {
            // For images, use Gemini Vision API
            const base64Image = Buffer.from(arrayBuffer).toString('base64')

            const { text } = await generateText({
                model: google('models/gemini-2.5-flash'),
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                image: `data:${fileType};base64,${base64Image}`,
                            },
                            {
                                type: 'text',
                                text: `Analyze this resume and provide a detailed assessment in JSON format:

{
  "score": <number 0-100>,
  "strengths": ["<string>", "<string>", "<string>"],
  "weaknesses": ["<string>", "<string>", "<string>"],
  "suggestions": ["<string>", "<string>", "<string>", "<string>", "<string>"],
  "keywords": ["<missing keyword 1>", "<missing keyword 2>", "<missing keyword 3>"]
}

Focus on:
- Professional presentation and formatting
- Relevant experience and skills
- Achievement quantification
- Industry keywords for tech/professional roles
- Overall clarity and impact

Return ONLY the JSON object, no markdown formatting or other text.`,
                            },
                        ],
                    },
                ],
            })

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error('Failed to parse AI response')
            }

            return NextResponse.json(JSON.parse(jsonMatch[0]))
        } else {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
        }

        // For text-based files (PDF, DOCX, TXT)
        if (resumeText) {
            const { text } = await generateText({
                model: google('models/gemini-2.5-flash'),
                prompt: `Analyze this resume and provide a detailed assessment in JSON format:

Resume:
${resumeText}

Provide your analysis in this exact JSON structure:
{
  "score": <number 0-100>,
  "strengths": ["<string>", "<string>", "<string>"],
  "weaknesses": ["<string>", "<string>", "<string>"],
  "suggestions": ["<string>", "<string>", "<string>", "<string>", "<string>"],
  "keywords": ["<missing keyword 1>", "<missing keyword 2>", "<missing keyword 3>"]
}

Focus on:
- Professional presentation
- Relevant experience and accomplishments
- Skills and expertise alignment
- Achievement quantification
- Missing industry keywords for tech/professional roles

Return ONLY the JSON object, no markdown formatting or other text.`,
            })

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error('Failed to parse AI response')
            }

            return NextResponse.json(JSON.parse(jsonMatch[0]))
        }

        return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 })
    } catch (error) {
        console.error('Resume analysis error:', error)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }
}
