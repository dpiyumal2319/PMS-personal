import React, {Suspense} from 'react';
import ProfileCard, {ProfileCardSkeleton} from "@/app/(dashboard)/admin/profile/_compoenents/ProfileCard";

const ProfilePage = () => {


    return (
        <div className="flex items-center justify-center h-full">
            <Suspense fallback={<ProfileCardSkeleton/>}>
                <ProfileCard/>
            </Suspense>
        </div>
    );
};

export default ProfilePage;
