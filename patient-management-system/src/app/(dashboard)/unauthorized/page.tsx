import React from 'react';
import {ShieldOff, ArrowLeft} from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="h-full flex items-center justify-center p-4">
            <div
                className="max-w-md w-full bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-8 border border-white/20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                    <ShieldOff className="h-8 w-8 text-red-600"/>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Unauthorized Access
                </h1>

                <p className="text-gray-600 mb-8">
                    Sorry, you don&#39;t have permission to access this page. Please contact your administrator if you think
                    this is a mistake.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2"/>
                        Return to Dashboard
                    </Link>

                    <Link
                        href='/logout'
                        className="inline-block w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Sign in with different account
                    </Link>
                </div>
            </div>
        </div>
    );
}