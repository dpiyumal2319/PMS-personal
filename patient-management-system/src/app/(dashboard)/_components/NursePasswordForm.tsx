"use client";
import { useState } from "react";
import { PasswordInput } from "@/app/(dashboard)/_components/PasswordInput";
import { changeUserPassword } from "@/app/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function UserPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const validateForm = () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      await toast.promise(
        changeUserPassword({ newPassword, confirmPassword }),
        {
          pending: "Updating password...",
          success: "Password updated successfully!",
          error: "Failed to update password",
        }
      );
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg bg-background-50">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-red-100 text-red-700">{error}</div>
        )}
        {success && (
          <div className="p-3 rounded-md bg-green-100 text-green-700">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            showPassword={showNew}
            toggleShow={() => setShowNew(!showNew)}
          />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            showPassword={showConfirm}
            toggleShow={() => setShowConfirm(!showConfirm)}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}
// import React from 'react'
// import { PasswordInput } from './PasswordInput'
// import { changeUserPassword } from '@/app/lib/actions'
// import { toast } from 'react-toastify'
// import { useRouter } from 'next/navigation'
// import { useState } from 'react'

// const UserPasswordForm = ({userId}:{userId:number}) => {
//     const [newPassword, setNewPassword] = useState("")
//     const [confirmPassword, setConfirmPassword] = useState("")
//     const [showNew, setShowNew] = useState(false)
//     const [showConfirm, setShowConfirm] = useState(false)
//     const [error, setError] = useState("")
//     const [success, setSuccess] = useState("")
//     const router = useRouter();

//     const validateForm = () => {
//         if(newPassword!== confirmPassword){
//             setError("Passwords do not match")
//             return false
//         }
//         if(newPassword.length < 8){
//             setError("Password must be at least 8 charaacters");
//             return false
//         }
//         return true
//     };

//     const handleSubmit = async (e:React.FormEvent) => {
//         e.preventDefault();
//         setError("");
//         setSuccess("");

//         if(!validateForm()) return;

//         try{

//             await toast.promise(
//             changeUserPassword({ userId, newPassword, confirmPassword }),
//             {
//                 pending: "Updating password...",
//                 success: "Password updated successfully!",
//                 error: {
//                     render({ data }) {
//                     return data instanceof Error ? data.message : 'Failed to update password';
//                     },
//                 }
//             },
//             {
//                 position: 'bottom-right',
//                 className: 'shadow-md'
//             }
//       );

//             setNewPassword("");
//             setConfirmPassword("");

//              setTimeout(() => {
//             router.push("/dashboard"); // Change this to your desired route
//       }, 2000);

//         }catch(error: any){
//             setError(error.message || "Something went wrong");
//         }

//     };
//   return (
//     <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg bg-background-50">
//       <h2 className="text-2xl font-bold text-primary-700 mb-6">Change Password</h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {error && <div className="p-3 rounded-md bg-red-100 text-red-700">{error}</div>}
//         {success && <div className="p-3 rounded-md bg-green-100 text-green-700">{success}</div>}

//         <div className="space-y-4">

//           <PasswordInput
//             label="New Password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             showPassword={showNew}
//             toggleShow={() => setShowNew(!showNew)}
//           />

//           <PasswordInput
//             label="Confirm Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             showPassword={showConfirm}
//             toggleShow={() => setShowConfirm(!showConfirm)}
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors"
//         >
//           Change Password
//         </button>
//       </form>
//     </div>
//   );
// }

// export default UserPasswordForm
