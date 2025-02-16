'use client';

import React from 'react';
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import UserAvatar from "@/app/(dashboard)/_components/UserAvatar";
import {Edit, Key} from "lucide-react";
import {Gender, Role} from "@prisma/client";

const ProfilePage = () => {
    const user = {
        name: "John Doe",
        email: "johndoe@example.com",
        telephone: "+94 71 234 5678",
        profilePic: null,
        gender: Gender.MALE,
        role: Role.DOCTOR,
    };

    return (
        <div className="flex items-center justify-center h-full bg-gray-100">
            <Card className="w-full max-w-md py-12 px-6 shadow-lg text-center">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-1">
                    <UserAvatar
                        imageUrl={user.profilePic}
                        size="xl"
                        gender={user.gender}
                        role={user.role}
                    />
                    <h2 className="mt-4 text-2xl font-semibold">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-gray-500">{user.telephone}</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col gap-4">
                    <Button variant="outline" className="flex items-center justify-center gap-2 w-full">
                        <Edit size={16}/> Edit Profile
                    </Button>
                    <Button className="flex items-center justify-center gap-2 w-full">
                        <Key size={16}/> Change Password
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ProfilePage;
