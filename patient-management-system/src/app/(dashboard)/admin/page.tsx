
import {prisma} from '@/app/lib/prisma';
import { Card } from "../_components/Card";




export default async function AdminPage() {


  const users = await prisma.user.findMany({
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      mobile: true,
    }
});



  const userData = users.map(user => ({
    ...user,
    role: user.role.toLowerCase() as "doctor" | "nurse", // Convert enum to lowercase
    telephone: user.mobile, // Map mobile to telephone
    profilePic: getDefaultAvatar(user.role) // Add default avatars
  }));

  return (
    <div className="p-8 bg-background-100 min-h-screen">
      <h1 className="text-4xl font-bold text-primary-700 font-montserrat mb-8">
        Medical Staff Management
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userData.map((user) => (
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
  return role === "DOCTOR" 
    ? "/doctor-avatar.jpg" 
    : "/nurse-avatar.jpg";
}

}