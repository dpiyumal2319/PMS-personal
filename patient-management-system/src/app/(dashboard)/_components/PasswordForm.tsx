"use client";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { PasswordInput } from "@/app/(dashboard)/_components/PasswordInput";

export function PasswordForm() {
const [userId, setUserId] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
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

  // Fetch session details when the component mounts
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/session"); //API route to get session data
        const data = await res.json();
        if (data?.id) {
          setUserId(data.id); //Store userId from session
        } else {
          router.push("/login"); // Redirect if no session
        }
      } catch (error) {
        console.error("Failed to fetch session", error);
      }
    }
    
    fetchSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      const response = await fetch("/api/changePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

     
      setTimeout(() => {
        router.push("/dashboard"); // Change this to your desired route
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg bg-background-50">
      <h2 className="text-2xl font-bold text-primary-700 mb-6">Change Password</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 rounded-md bg-red-100 text-red-700">{error}</div>}
        {success && <div className="p-3 rounded-md bg-green-100 text-green-700">{success}</div>}

        <div className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            showPassword={showCurrent}
            toggleShow={() => setShowCurrent(!showCurrent)}
          />

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
