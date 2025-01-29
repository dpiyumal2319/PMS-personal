import Link from "next/link";
import LoginForm from "@/app/(auth)/login/_componets/LoginForm";

export default function LoginPage() {
    // const [errorMessage, formAction, Pending] = useActionState(login, '');

    // Rendered on client or server side
    console.log(`Rendered on ${typeof window === 'undefined' ? 'server' : 'client'} side`);

    return (
        // <form action={formAction} className="flex flex-col items-center justify-center h-screen">
        //     <h1 className="text-2xl mb-4">Select Your Role</h1>
        //
        //     {/* Role Selection */}
        //     <select name="role" className="p-2 border mb-4">
        //         <option value="doctor">Doctor</option>
        //         <option value="nurse">Nurse</option>
        //     </select>
        //
        //     {/* User ID Input */}
        //     <input
        //         name="id"
        //         placeholder="User ID"
        //         className="p-2 border mb-4"
        //         required
        //     />
        //
        //     {/* Error Message Display */}
        //     {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        //
        //     {/* Submit Button */}
        //     <button type="submit" className="bg-primary text-white p-2 rounded" disabled={Pending}>
        //         {Pending ? 'Loading...' : 'Login'}
        //     </button>
        // </form>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>

                <LoginForm />

                <div className={'mt-2'}>
                    <Link href={'#'} className={'text-sm text-primary-600 hover:text-primary-500 text-center'}
                    >
                        Forget Password?
                    </Link>
                </div>
            </div>
        </div>
    );
}
