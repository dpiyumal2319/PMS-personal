import Image from "next/image";
import Link from "next/link";

interface CardProps {
  role: "doctor" | "nurse";
  name: string;
  email: string;
  telephone: string;
  profilePic?: string;
}

export function Card({ role, name, email, telephone, profilePic }: CardProps) {
  const roleColors = {
    doctor: "border-primary-500",
    nurse: "border-primary-300",
  };

  const link = role === "doctor" ? `/changePassword` : `/changePasswordNurse`;

  return (
    <div
      className={`w-80 p-6 rounded-xl shadow-lg bg-background-50 border-l-4 ${roleColors[role]}`}
    >
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-12 h-12">
          <Image
            src={profilePic || "/default-avatar.png"}
            alt={name}
            className="rounded-full object-cover"
            fill
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-primary-700">{name}</h2>
          <p className="text-sm capitalize text-primary-500">{role}</p>
        </div>
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
        <div>
          <Link
            href={link}
            className="ring-1 text-primary-600 ring-primary-600 px-3 py-2 hover:bg-primary-600 hover:text-white text-sm rounded-full inline-block text-center"
          >
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
}
