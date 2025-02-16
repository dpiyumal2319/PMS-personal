import {logout} from "@/app/lib/auth";
import PendingPatients from "@/app/(dashboard)/_components/PendingPatients";
import {LogOut} from "lucide-react";
import CustomIconButton from "@/app/(dashboard)/_components/CustomIconButton";
import React from "react";
import UserAvatar from "@/app/(dashboard)/_components/RoleAvatar";
import {verifySession} from "@/app/lib/sessions";
import CustomSideBarTrigger from "@/app/(dashboard)/_components/CustomSideBarTrigger";


export default async function TopBar() {
    const session = await verifySession();

    return (
        <div
            className={"h-14 bg-white flex items-center justify-between py-3 px-4 border-b border-primary-900/25 shadow"}>
            <div className={"flex items-center gap-3"}>
                <CustomSideBarTrigger />
                <PendingPatients/>
            </div>
            <div>
                <div className={"flex gap-3 items-center"}>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{session.name}</span>
                    </div>
                    <UserAvatar
                        role={session.role}
                        name={session.name}
                        // imageUrl={session.imageUrl} // Uncomment if available in session
                    />
                    <CustomIconButton icon={LogOut} onClick={logout} iconSize={18}/>
                </div>
            </div>
        </div>
    );
}