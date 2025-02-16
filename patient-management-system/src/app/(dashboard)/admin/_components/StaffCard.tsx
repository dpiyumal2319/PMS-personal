import {Card} from "@/components/ui/card";
import UserAvatar from "@/app/(dashboard)/_components/UserAvatar";
import {Gender, Role} from "@prisma/client";
import EditProfileDialog from "@/app/(dashboard)/admin/_components/EditProfileDialog";
import ChangePasswordDialog from "@/app/(dashboard)/admin/_components/ChangePasswordDialog";

interface CardProps {
    name: string;
    email: string;
    gender: Gender;
    id: number;
    telephone: string;
    profilePic: string | null;
}

export function StaffCard({name, email, telephone, profilePic, gender, id}: CardProps) {
    return (
        <Card
            className={`w-80 p-6 rounded-xl shadow-lg bg-background-50 border-l-4 border-primary-800 hover:shadow-xl transition-all duration-300`}
        >
            {/* Profile Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className={`flex items-center gap-4`}>
                    <div className="relative w-12 h-12">
                        <UserAvatar role={Role.NURSE} name={name} imageUrl={profilePic} size="lg" gender={gender}/>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-primary-700">{name}</h2>
                        <p className="text-sm capitalize text-primary-500">Nurse</p>
                    </div>
                </div>
                <EditProfileDialog
                    name={name}
                    email={email}
                    telephone={telephone}
                    gender={gender}
                    id={id}
                />
            </div>

            {/* Details Section */}
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-primary-600">Email</label>
                    <div className="p-2 mt-1 rounded-md bg-background-100 font-mono text-sm">
                        {email}
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-primary-600">
                        Telephone
                    </label>
                    <div className="p-2 mt-1 rounded-md bg-background-100 font-mono text-sm">
                        {telephone}
                    </div>
                </div>
                <div className={`flex items-center justify-end gap-2`}>
                    <ChangePasswordDialog userID={id}/>
                </div>
            </div>
        </Card>
    );
}
