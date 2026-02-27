import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client – uses service_role key to bypass RLS.
 * Only use this in Server Components / Route Handlers (never in client code).
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}
