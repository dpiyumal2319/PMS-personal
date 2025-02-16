import {getStaff} from "@/app/lib/auth";
import {StaffCard} from "./_components/StaffCard";

// Awaited type of get staff
type Staff = Awaited<ReturnType<typeof getStaff>>;


export default async function AdminPage() {
    const staff: Staff = await getStaff();
    return (
        <div className="p-4 min-h-screen">
            <h1 className="text-3xl font-bold text-primary-700 font-montserrat mb-8">
                Medical Staff Management
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {staff.map((user) => (
                    <StaffCard
                        gender={user.gender}
                        key={user.id}
                        name={user.name}
                        email={user.email}
                        telephone={user.mobile}
                        profilePic={user.image}
                        id={user.id}
                    />
                ))}
            </div>
        </div>
    );
}
