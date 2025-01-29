"use client";
import { useState } from "react";
import { MdLock, MdRemoveRedEye } from "react-icons/md"; // Import React Icons

interface PasswordInputProps {
  password: string;
}

export const PasswordInput = ({ password }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative mt-1">
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        readOnly
        className="w-full p-2 pr-10 rounded-md bg-background-100 border border-background-300 font-mono"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-600"
      >
        {showPassword ? (
          <MdRemoveRedEye className="w-5 h-5" /> // Eye open icon
        ) : (
          <MdLock className="w-5 h-5" /> // Lock icon
        )}
      </button>
    </div>
  );
};