import {logout} from "@/app/lib/auth";
import PendingPatients from "@/app/(dashboard)/_components/topbar/PendingPatients";
import {LogOut} from "lucide-react";
import CustomIconButton from "@/app/(dashboard)/_components/topbar/CustomIconButton";
import React, {Suspense} from "react";
import CustomSideBarTrigger from "@/app/(dashboard)/_components/topbar/CustomSideBarTrigger";
import UserDetails, {UserDetailsSkeleton} from "@/app/(dashboard)/_components/topbar/user-details";


export default async function TopBar() {
    return (
        <div
            className={"h-14 bg-white flex items-center justify-between px-1 py-3 border-b border-primary-900/25 shadow"}>
            <div className={"flex items-center gap-3"}>
                <CustomSideBarTrigger/>
                <PendingPatients/>
            </div>
            <div>
                <div className={"flex gap-3 items-center"}>
                    <Suspense fallback={<UserDetailsSkeleton/>}>
                        <UserDetails/>
                    </Suspense>
                    <CustomIconButton icon={LogOut} onClick={logout} iconSize={18}/>
                </div>
            </div>
        </div>
    );
}