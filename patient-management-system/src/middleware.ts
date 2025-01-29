import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from "@/app/lib/sessions";
import { cookies } from 'next/headers';

// 1. Specify only the public routes
const publicRoutes = ['/login', '/', '/signup'];

// 2. The rest of the routes are considered protected
export default async function middleware(req: NextRequest) {
    console.log('Middleware running');

    // 3. Get the current path
    const path = req.nextUrl.pathname;

    // 4. Check if the current route is public
    const isPublicRoute = publicRoutes.includes(path);

    // 5. Decrypt the session from the cookie
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    // 6. Redirect to /login if the user is not authenticated and trying to access a protected route
    if (!isPublicRoute && !session?.id) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // 7. Redirect to /dashboard if the user is authenticated and trying to access a public route
    if (isPublicRoute && session?.id && !req.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
