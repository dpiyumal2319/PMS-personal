import React from 'react';
import UserAvatar from "@/app/(dashboard)/_components/topbar/RoleAvatar";
import {verifySession} from "@/app/lib/sessions";
import {Skeleton} from "@/components/ui/skeleton";

const UserDetails = async () => {
    const session = await verifySession();

    return (
        <div className="flex items-center gap-3">
            <div className="flex flex-col">
                <span className="font-medium text-sm">{session.name}</span>
            </div>
            <UserAvatar
                role={session.role}
                name={session.name}
                // imageUrl={session.imageUrl} // Uncomment if available in session
            />
        </div>
    );
};


const UserDetailsSkeleton = () => {
    return (
        <div className="flex items-center gap-3">
            <Skeleton className="w-20 h-4"/>
            <Skeleton className="w-8 h-8 rounded-full"/>
        </div>
    );
}

export {UserDetailsSkeleton};

export default UserDetails;