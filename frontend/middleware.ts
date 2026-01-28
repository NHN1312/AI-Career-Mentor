import { type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    // 1. Run next-intl middleware first to handle i18n redirects/rewrites
    const intlResponse = intlMiddleware(request);

    // If next-intl redirects (e.g. / -> /en), return immediately
    if (intlResponse.headers.get('location')) {
        return intlResponse;
    }

    // 2. Run Supabase middleware (Protection & Session Refresh)
    // We pass the request to updateSession, but we essentially need to merge responses.
    // NOTE: updateSession logic needs to be aware of localized paths!
    const supabaseResponse = await updateSession(request);

    // If Supabase redirects (e.g. to /login), return that immediately
    if (supabaseResponse.headers.get('location')) {
        return supabaseResponse;
    }

    // 3. Merge cookies: apply Supabase's set-cookie headers to the intlResponse
    // (This ensures session refreshing works while keeping i18n rewrites)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        intlResponse.cookies.set(cookie.name, cookie.value, cookie)
    });

    return intlResponse;
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next`, `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        '/((?!api|_next|_vercel|auth|.*\\..*).*)',
    ],
}
