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

    // 2. Save User Message
    const lastMessage = messages[messages.length - 1];
    await supabase.from('messages').insert({
        chat_id: chatId,
        role: 'user',
        content: lastMessage.content
    });

    // 3. Stream & Save Assistant Message
    const result = await streamText({
        model: google('models/gemini-2.5-flash'),
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
