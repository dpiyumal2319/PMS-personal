'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {getPendingPatientsCount} from "@/app/lib/actions";

const PendingPatients = () => {
    const [pending, setPending] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchPendingPatients = async () => {
            try {
                const count = await getPendingPatientsCount();
                setPending(count);
            } catch (error) {
                console.error("Failed to fetch pending patients count:", error);
            }
        };

        // Initial fetch
        fetchPendingPatients().then();

        // Set interval to refetch every 3 minutes (180000ms)
        const interval = setInterval(fetchPendingPatients, 180000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    const handleClick = () => {
        router.push(`/queue/active`);
    };

    return (
        <button
            onClick={handleClick}
            className={`relative flex items-center gap-2 p-2 rounded text-white transition-all duration-200
                ${pending > 0 ? "bg-primary-500 hover:bg-primary-600 cursor-pointer" : "bg-gray-400 cursor-default"}
            `}
            disabled={pending === 0}
        >
            {pending > 0 ? (
                <span className="animate-ping h-2 w-2 rounded-full bg-amber-400"></span>
            ) : (
                <span className="h-2 w-2 rounded-full bg-gray-200"></span>
            )}
            <span className={`font-bold ${pending === 0 ? "text-gray-300" : ""}`}>{pending}</span>
            <span>{pending === 0 ? "No Patients" : "Patients"}</span>
        </button>
    );
};

export default PendingPatients;
