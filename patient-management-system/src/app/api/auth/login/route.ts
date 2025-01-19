import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { role } = await req.json();

    if (!["doctor", "nurse"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("role", role, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
}
