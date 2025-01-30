import { UserPasswordForm } from "@/app/(dashboard)/_components/NursePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen bg-background-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-700 font-montserrat mb-8">
          Account Security
        </h1>
        <UserPasswordForm />
      </div>
    </div>
  );
}
