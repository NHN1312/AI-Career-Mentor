import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
    try {
        const { section, context, currentText, locale } = await req.json();

        let prompt = '';
        const languageInstruction = locale === 'vi' ? 'Answer in Vietnamese.' : 'Answer in English.';

        switch (section) {
            case 'summary':
                prompt = `You are a professional resume writer. Write a compelling professional summary for a ${context.jobTitle || 'candidate'}.
                
                Context:
                ${JSON.stringify(context)}
                
                ${currentText ? `Rewrite/Improve this existing summary: "${currentText}"` : 'Generate a new summary.'}
                
                Keep it professional, concise (2-3 sentences), and impactful.
                ${languageInstruction}`;
                break;
            case 'experience':
                prompt = `You are a professional resume writer. Write a bullet point or description for a work experience entry.
                
                Role: ${context.position} at ${context.company}
                Keywords/Achievements: ${context.keywords || ''}
                
                ${currentText ? `Rewrite/Improve this description to be more result-oriented and use action verbs: "${currentText}"` : 'Generate a description highlighting key responsibilities and achievements.'}
                
                Keep it concise and use strong action verbs.
                ${languageInstruction}`;
                break;
            case 'skills':
                prompt = `You are a professional resume writer. Suggest a list of relevant technical and soft skills for a ${context.jobTitle || 'candidate'}.
                
                Context:
                ${JSON.stringify(context)}
                
                ${currentText ? `Improve/Expand this skill list: "${currentText}"` : 'Generate a list of top 10 relevant skills.'}
                
                Return only the list of skills, comma-separated.
                ${languageInstruction}`;
                break;
            default:
                return new Response('Invalid section', { status: 400 });
        }

        const { text } = await generateText({
            model: google('models/gemini-1.5-flash'),
            prompt: prompt,
        });

        return Response.json({ text });
    } catch (error) {
        console.error('CV Gen Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
