'use client';

import React, { useActionState } from 'react';
import { login } from "@/app/lib/auth";

function LoginForm() {
    const [state, action, pending] = useActionState(login, '');

    return (
        <form action={action} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    name="email" // ✅ Added name attribute
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="your@email.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                    type="password"
                    name="password" // ✅ Added name attribute
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>

            {/* Error message */}
            {state && <div className="text-red-500 text-sm">{state}</div>}

            <button
                type="submit"
                disabled={pending} // ✅ Disable button while submitting
                className="w-full bg-primary hover:bg-primary-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
                {pending ? 'Loading...' : 'Login'}
            </button>
        </form>
    );
}

export default LoginForm;
