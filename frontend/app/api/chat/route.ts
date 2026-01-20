import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, chatId } = await req.json();
    const supabase = await createClient(); // Await the async server client creation if needed, or check implementation. 
    // utils/supabase/server.ts usually exports a helper. Let's assume sync or async based on common patterns.
    // Actually created server.ts uses `createServerClient`, which is sync? No, cookies methods are async in Next.js 15+ but here we are in 16.
    // Let's check server.ts implementation again if I can. But standard pattern:

    const { data: { user } } = await supabase.auth.getUser();

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

    userContext += `\n\nProvide personalized career guidance based on this profile. Be specific and actionable.`

    // 3. Save User Message
    const lastMessage = messages[messages.length - 1];
    await supabase.from('messages').insert({
        chat_id: chatId,
        role: 'user',
        content: lastMessage.content
    });

    // 4. Stream AI response
    const result = await streamText({
        model: google('models/gemini-1.5-flash'),
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
