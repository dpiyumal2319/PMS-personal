import Link from "next/link";

export default function LandingPage() {
    return (
        <div>
            <h1 className="text-4xl font-bold text-primary-500">Welcome to the Patient Management System</h1>
            <p className="text-lg">This is a simple patient management system built with Next.js and Tailwind CSS.</p>
            <Link href="/login">
                <button className="bg-primary-500 text-white p-2 rounded mt-4">Get Started</button>
            </Link>
        </div>
    );
}