import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { extractText } from 'unpdf'
import mammoth from 'mammoth'
import { createClient } from '@/utils/supabase/server'

export const maxDuration = 60

type ResumeData = {
    skills: Array<{ name: string; category: string; level?: string; years?: number }>
    education: Array<{ institution: string; degree: string; field?: string; startDate?: string; endDate?: string }>
    certifications: Array<{ name: string; organization?: string; date?: string }>
    workExperience: Array<{ company: string; position: string; startDate?: string; endDate?: string; description?: string }>
    yearsOfExperience?: number
    currentRole?: string
    summary?: string
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const locale = formData.get('locale') as string || 'en'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let resumeText = ''
        const fileType = file.type
        const arrayBuffer = await file.arrayBuffer()

        // Parse file based on type
        if (fileType === 'application/pdf') {
            const result = await extractText(new Uint8Array(arrayBuffer))
            resumeText = Array.isArray(result.text) ? result.text.join('\n') : result.text
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) })
            resumeText = result.value
        } else if (fileType === 'text/plain') {
            resumeText = await file.text()
        } else if (fileType.startsWith('image/')) {
            const base64Image = Buffer.from(arrayBuffer).toString('base64')
            resumeText = `[Image Resume - analyzed via Vision API]`

            // For images, analyze with Vision API
            const { text } = await generateText({
                model: google('models/gemini-2.5-flash'),
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'image', image: `data:${fileType};base64,${base64Image}` },
                        { type: 'text', text: getAnalysisPrompt(locale) }
                    ],
                }],
            })

            const analysis = parseAnalysisResponse(text)

            // Extract structured data from image
            const structuredData = await extractStructuredData(base64Image, fileType)
            await saveResumeData(supabase, user.id, file.name, fileType, analysis, structuredData)

            return NextResponse.json({ ...analysis, dataSaved: true })
        } else {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
        }

        // For text-based files, analyze
        if (resumeText) {
            const { text } = await generateText({
                model: google('models/gemini-2.5-flash'),
                prompt: getAnalysisPrompt(locale) + `\n\nResume:\n${resumeText}`,
            })

            const analysis = parseAnalysisResponse(text)

            // Extract structured data
            const structuredData = await extractStructuredDataFromText(resumeText)
            await saveResumeData(supabase, user.id, file.name, fileType, analysis, structuredData)

            return NextResponse.json({ ...analysis, dataSaved: true })
        }

        return NextResponse.json({ error: 'Could not extract text' }, { status: 400 })
    } catch (error) {
        console.error('Resume analysis error:', error)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }
}

function getAnalysisPrompt(locale: string = 'en') {
    const languageInstruction = locale === 'vi' ? 'Respond in Vietnamese (Tiếng Việt).' : 'Respond in English.';

    return `Analyze this resume and provide a detailed assessment in JSON format:

{
  "score": <number 0-100>,
  "strengths": ["<string>", "<string>", "<string>"],
  "weaknesses": ["<string>", "<string>", "<string>"],
  "suggestions": ["<string>", "<string>", "<string>", "<string>", "<string>"],
  "keywords": ["<missing keyword 1>", "<missing keyword 2>", "<missing keyword 3>"]
}

Focus on professional presentation, relevant experience, skills, achievement quantification, and industry keywords.

${languageInstruction}

Return ONLY the JSON object, no markdown or other text.`
}

function parseAnalysisResponse(text: string) {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Failed to parse AI response')
    return JSON.parse(jsonMatch[0])
}

async function extractStructuredDataFromText(resumeText: string): Promise<ResumeData> {
    const { text } = await generateText({
        model: google('models/gemini-2.5-flash'),
        prompt: `Extract ALL information from this resume. Be thorough and extract EVERY skill, education, certification, and job mentioned.

Resume:
${resumeText}

Return JSON with this EXACT structure:
{
  "skills": [
    {"name": "skill name", "category": "technical|tool|framework|soft_skill|language", "level": "Beginner|Intermediate|Advanced|Expert", "years": <number or null>}
  ],
  "education": [
    {"institution": "school name", "degree": "degree type", "field": "field of study", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD or null if current"}
  ],
  "certifications": [
    {"name": "certification name", "organization": "issuing org", "date": "YYYY-MM-DD"}
  ],
  "workExperience": [
    {"company": "company name", "position": "job title", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD or null if current", "description": "brief description"}
  ],
  "yearsOfExperience": <total years as number>,
  "currentRole": "current job title or Intern/Student if applicable",
  "summary": "professional summary"
}

IMPORTANT:
- Extract ALL skills mentioned (technical, tools, frameworks, languages, soft skills)
- Categories: technical (HTML, CSS, JS, Python), tool (Git, Docker, Figma), framework (React, Django), soft_skill (Leadership, Communication), language (English, Vietnamese)
- Dates MUST be "YYYY-MM-DD" format. If only year/month given, use "YYYY-MM-01" or "YYYY-01-01"
- If no specific date, use null
- Extract everything thoroughly

Return ONLY the JSON object.`,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Failed to parse structured data')

    const data = JSON.parse(jsonMatch[0])

    // Normalize dates to PostgreSQL format
    return normalizeDates(data)
}

async function extractStructuredData(base64Image: string, fileType: string): Promise<ResumeData> {
    const { text } = await generateText({
        model: google('models/gemini-2.5-flash'),
        messages: [{
            role: 'user',
            content: [
                { type: 'image', image: `data:${fileType};base64,${base64Image}` },
                { type: 'text', text: `Extract ALL information from this resume image. Same JSON structure as text extraction. Be very thorough and extract EVERY skill, education entry, certification, and job.` }
            ],
        }],
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Failed to parse structured data')

    const data = JSON.parse(jsonMatch[0])
    return normalizeDates(data)
}

function normalizeDates(data: ResumeData): ResumeData {
    // Normalize education dates
    if (data.education) {
        data.education = data.education.map(edu => ({
            ...edu,
            startDate: normalizeDate(edu.startDate),
            endDate: normalizeDate(edu.endDate),
        }))
    }

    // Normalize certification dates
    if (data.certifications) {
        data.certifications = data.certifications.map(cert => ({
            ...cert,
            date: normalizeDate(cert.date),
        }))
    }

    // Normalize work experience dates
    if (data.workExperience) {
        data.workExperience = data.workExperience.map(exp => ({
            ...exp,
            startDate: normalizeDate(exp.startDate),
            endDate: normalizeDate(exp.endDate),
        }))
    }

    return data
}

function normalizeDate(date: string | undefined): string | undefined {
    if (!date) return undefined

    // If already YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date

    // If YYYY-MM format, add -01
    if (/^\d{4}-\d{2}$/.test(date)) return `${date}-01`

    // If YYYY format, add -01-01
    if (/^\d{4}$/.test(date)) return `${date}-01-01`

    return date
}

async function saveResumeData(
    supabase: any,
    userId: string,
    fileName: string,
    fileType: string,
    analysis: any,
    data: ResumeData
) {
    console.log('=== Starting saveResumeData ===')
    console.log('User ID:', userId)
    console.log('Structured Data:', JSON.stringify(data, null, 2))

    try {
        // Save resume analysis
        const { error: analysisError } = await supabase.from('resume_analyses').insert({
            user_id: userId,
            file_name: fileName,
            file_type: fileType,
            score: analysis.score,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            suggestions: analysis.suggestions,
            keywords: analysis.keywords,
        })

        if (analysisError) {
            console.error('❌ Error saving resume_analyses:', analysisError)
            throw analysisError
        }
        console.log('✅ Saved resume_analyses')

        // Update profile summary
        if (data.currentRole || data.yearsOfExperience || data.summary) {
            const { error: profileError } = await supabase.from('profiles').update({
                current_role: data.currentRole,
                years_of_experience: data.yearsOfExperience,
                summary: data.summary,
                updated_at: new Date().toISOString(),
            }).eq('id', userId)

            if (profileError) {
                console.error('❌ Error updating profiles:', profileError)
            } else {
                console.log('✅ Updated profile')
            }
        }

        // Save skills (delete old, insert new)
        const { error: deleteSkillsError } = await supabase
            .from('user_skills')
            .delete()
            .eq('user_id', userId)
            .eq('source', 'resume')

        if (deleteSkillsError) {
            console.error('⚠️ Error deleting old skills:', deleteSkillsError)
        }

        if (data.skills?.length) {
            const skillsToInsert = data.skills.map(skill => ({
                user_id: userId,
                skill_name: skill.name,
                skill_category: skill.category,
                proficiency_level: skill.level,
                years_of_experience: skill.years,
                source: 'resume',
            }))

            console.log('Inserting skills:', skillsToInsert)

            const { error: skillsError } = await supabase
                .from('user_skills')
                .insert(skillsToInsert)

            if (skillsError) {
                console.error('❌ Error saving skills:', skillsError)
            } else {
                console.log(`✅ Saved ${data.skills.length} skills`)
            }
        }

        // Save education
        const { error: deleteEduError } = await supabase
            .from('user_education')
            .delete()
            .eq('user_id', userId)

        if (deleteEduError) {
            console.error('⚠️ Error deleting old education:', deleteEduError)
        }

        if (data.education?.length) {
            const { error: eduError } = await supabase.from('user_education').insert(
                data.education.map(edu => ({
                    user_id: userId,
                    institution: edu.institution,
                    degree: edu.degree,
                    field_of_study: edu.field,
                    start_date: edu.startDate,
                    end_date: edu.endDate,
                }))
            )

            if (eduError) {
                console.error('❌ Error saving education:', eduError)
            } else {
                console.log(`✅ Saved ${data.education.length} education records`)
            }
        }

        // Save certifications
        const { error: deleteCertsError } = await supabase
            .from('user_certifications')
            .delete()
            .eq('user_id', userId)

        if (deleteCertsError) {
            console.error('⚠️ Error deleting old certifications:', deleteCertsError)
        }

        if (data.certifications?.length) {
            const { error: certsError } = await supabase.from('user_certifications').insert(
                data.certifications.map(cert => ({
                    user_id: userId,
                    certification_name: cert.name,
                    issuing_organization: cert.organization,
                    issue_date: cert.date,
                }))
            )

            if (certsError) {
                console.error('❌ Error saving certifications:', certsError)
            } else {
                console.log(`✅ Saved ${data.certifications.length} certifications`)
            }
        }

        // Save work experience
        const { error: deleteExpError } = await supabase
            .from('user_work_experience')
            .delete()
            .eq('user_id', userId)

        if (deleteExpError) {
            console.error('⚠️ Error deleting old work experience:', deleteExpError)
        }

        if (data.workExperience?.length) {
            const { error: expError } = await supabase.from('user_work_experience').insert(
                data.workExperience.map(exp => ({
                    user_id: userId,
                    company: exp.company,
                    position: exp.position,
                    start_date: exp.startDate,
                    end_date: exp.endDate,
                    description: exp.description,
                }))
            )

            if (expError) {
                console.error('❌ Error saving work experience:', expError)
            } else {
                console.log(`✅ Saved ${data.workExperience.length} work experiences`)
            }
        }

        console.log('=== saveResumeData completed successfully ===')
    } catch (error) {
        console.error('=== FATAL ERROR in saveResumeData ===', error)
        throw error
    }
}
