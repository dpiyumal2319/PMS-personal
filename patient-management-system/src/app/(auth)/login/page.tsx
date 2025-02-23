import React from 'react';
import Link from "next/link";
import LoginForm from "@/app/(auth)/login/_componets/LoginForm";
import {Stethoscope} from "lucide-react";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "PMS - Login",
    description: "Patient Management System - Login",
};

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white flex flex-col">
            {/* Header */}
            <header className="bg-white/70 backdrop-blur-md shadow-sm">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                    <Link href="/" className="flex items-center">
                        <Stethoscope className="h-8 w-8 text-blue-600"/>
                        <span className="ml-2 text-xl font-bold text-gray-900">
                            MediPanel
                        </span>
                    </Link>
                </nav>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div
                    className="max-w-sm w-full bg-white/70 rounded-xl shadow-lg p-8 border border-white/20">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="mt-2 text-gray-600">Please sign in to your account</p>
                    </div>
                    <LoginForm/>
                    <div className="mt-6 space-y-4">
                        <div className="text-center">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-50/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            © 2025 ColorNovels. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}