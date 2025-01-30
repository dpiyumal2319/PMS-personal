import { getUsers } from "@/app/lib/auth";
import { Card } from "../_components/Card";

export default async function AdminPage() {
  const users = await getUsers();
  return (
    <div className="p-8 bg-background-100 min-h-screen">
      <h1 className="text-4xl font-bold text-primary-700 font-montserrat mb-8">
        Medical Staff Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card
            key={user.id}
            role={user.role}
            name={user.name}
            email={user.email}
            telephone={user.telephone}
            profilePic={user.profilePic}
          />
        ))}
      </div>
    </div>
  );

  // Helper function for default avatars
  function getDefaultAvatar(role: "DOCTOR" | "NURSE") {
    return role === "DOCTOR" ? "/doctor-avatar.jpg" : "/nurse-avatar.jpg";
  }
}
