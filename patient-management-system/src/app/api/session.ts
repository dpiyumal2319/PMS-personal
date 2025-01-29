import { NextRequest,NextResponse } from "next/server";
import { verifySession } from "@/app/lib/sessions";

export async function GET(req: NextRequest){
    try{
        const session = await verifySession();
        console.log(session);
        return NextResponse.json(session);
    }catch(e){
        return NextResponse.json({e:"Not authenticated"},{status:401});
    }
}