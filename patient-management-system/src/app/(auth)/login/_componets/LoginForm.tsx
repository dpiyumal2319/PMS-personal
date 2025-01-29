import React from 'react';

function LoginForm() {
    return (
        <form className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="your@email.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>

            <button
                className="w-full bg-primary hover:bg-primary-600 text-white font-medium py-2.5 rounded-lg transition-colors">
                Sign In
            </button>
        </form>
    );
}

export default LoginForm;