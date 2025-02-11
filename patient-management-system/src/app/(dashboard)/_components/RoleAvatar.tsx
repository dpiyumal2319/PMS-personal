import React from 'react';
import { verifySession } from "@/app/lib/sessions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FaUserDoctor } from "react-icons/fa6";
import { FaUserNurse } from "react-icons/fa";

const RoleAvatar = async () => {
    const session = await verifySession();
    const role = session.role; // 'DOCTOR' or 'NURSE'

    return (
        <Avatar
            className={`w-10 h-10 shadow-md`}
        >
            <AvatarFallback
                className={`flex items-center justify-center w-full h-full rounded-full 
                    ${role === "DOCTOR" ? "bg-blue-200 text-blue-600" : "bg-green-100 text-green-600"}`}
            >
                {role === "DOCTOR" ? (
                    <FaUserDoctor className="w-6 h-6" />
                ) : (
                    <FaUserNurse className="w-6 h-6" />
                )}
            </AvatarFallback>
        </Avatar>
    );
};

export default RoleAvatar;
