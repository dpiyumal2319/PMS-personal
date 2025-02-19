import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/sessions";
import { cookies } from "next/headers";

const publicRoutes = ["/login", "/", "/signup"];
const doctorOnlyRoutes = [
    "/patients/[id]/prescriptions",
    "/patients/[id]/prescriptions/add",
    "/patients/[id]/reports",
    "/patients/[id]/notes",
    "/admin/staff",
    "/admin/reports",
    "/admin/fees",
    "/inventory/cost-management",
];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);

    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);
    const role = session?.role;

    // Redirect to /login if the user is not authenticated and trying to access a protected route
    if (!isPublicRoute && !session?.id) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // Restrict doctor-only routes
    const isDoctorOnlyRoute = doctorOnlyRoutes.includes(path);
    if (isDoctorOnlyRoute && role !== 'DOCTOR') {
        return NextResponse.redirect(new URL("/unauthorized", req.nextUrl));
    }

    // Redirect authenticated users away from the login page
    if (path === "/login" && session?.id) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
