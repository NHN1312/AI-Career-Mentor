import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let locale = 'en'; // Default

    // We need to extract locale from the request if possible, but streamText accepts `messages`.
    // Usually, we pass locale as a separate part of the body, but useChat sends strict body.
    // We can infer locale from the last message or pass it via headers or data.
    // For now, let's assume 'en' unless we can find a way to pass it.
    // Better: Allow the client to send a system message with the language instruction?
    // Or we can parse the request body which is handled by streamText...
    // streamText usually takes `messages` directly.
    // Let's rely on the frontend sending a 'system' message with language preference OR
    // check if we can parse the request body before calling streamText?
    // `req.json()` consumes the body.

    // Workaround: The previous messages should theoretically contain the context if we append it.
    // But for a cleaner implementation, we can wrap req.json() and then pass messages.

    const body = await req.json();
    const { messages, data, chatId } = body;
    // Check if `data` contains locale? useChat allows sending extra `data`.

    locale = (data && data.locale) ? data.locale : 'en';
    const languageInstruction = locale === 'vi' ? 'Respond in Vietnamese (Tiếng Việt).' : 'Respond in English.';

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 1. Ensure Chat Exists
    // We try to insert. If it fails (duplicate), we ignore.
    // Or simpler: check existence.
    // Since chatId is UUID from client, we can just insert and on conflict do nothing.
    // But we need a title.
    const title = messages.length > 0 ? messages[0].content.substring(0, 50) : 'New Chat';

    // Check if chat exists to avoid overwriting title or to create it
    const { data: existingChat } = await supabase.from('chats').select('id').eq('id', chatId).single();

    if (!existingChat) {
        await supabase.from('chats').insert({
            id: chatId,
            user_id: user.id,
            title: title
        });
    }

    // 2. Fetch User Profile for Context
    const { data: profile } = await supabase
        .from('profiles')
        .select('current_role, years_of_experience, summary')
        .eq('id', user.id)
        .single()

    const { data: skills } = await supabase
        .from('user_skills')
        .select('skill_name, skill_category, proficiency_level')
        .eq('user_id', user.id)
        .order('proficiency_level', { ascending: false })
        .limit(10)

    // Build context message
    let userContext = "You are an AI Career Mentor assistant."

    if (profile?.current_role || profile?.years_of_experience) {
        userContext += `\n\nUser Profile:`
        if (profile.current_role) userContext += `\n- Current Role: ${profile.current_role}`
        if (profile.years_of_experience) userContext += `\n- Years of Experience: ${profile.years_of_experience}`
        if (profile.summary) userContext += `\n- Summary: ${profile.summary}`
    }

    if (skills && skills.length > 0) {
        const techSkills = skills.filter(s => s.skill_category === 'technical').map(s => s.skill_name).join(', ')
        const frameworks = skills.filter(s => s.skill_category === 'framework').map(s => s.skill_name).join(', ')

        userContext += `\n\nUser Skills:`
        if (techSkills) userContext += `\n- Technical: ${techSkills}`
        if (frameworks) userContext += `\n- Frameworks: ${frameworks}`
    }

    userContext += `\n\nIMPORTANT INSTRUCTION: You have access to the user's profile and skills above. Use this information ONLY if the user explicitly asks for advice, career guidance, or questions related to their profile.
    
    If the user greets you (e.g., "Hello", "Hi", "Xin chào") or asks a general question unrelated to their specific profile, respond normally and briefly. DO NOT recite their profile back to them or give unsolicited career advice in the first message.
    
    When you DO provide advice, be specific, actionable, and use the profile data to tailor your response.`
    userContext += `\n\n${languageInstruction}`;

    // 3. Save User Message
    const lastMessage = messages[messages.length - 1];
    await supabase.from('messages').insert({
        chat_id: chatId,
        role: 'user',
        content: lastMessage.content
    });

    // 4. Stream AI response
    const result = await streamText({
        model: google('models/gemini-2.5-flash'),
        system: userContext,
        messages,
        onFinish: async ({ text }) => {
            await supabase.from('messages').insert({
                chat_id: chatId,
                role: 'assistant',
                content: text
            });
        },
    });

    return result.toTextStreamResponse();
}
