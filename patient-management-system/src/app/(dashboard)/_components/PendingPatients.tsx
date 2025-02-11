'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveQueue, getPendingPatientsCount } from "@/app/lib/actions";

const PendingPatients = () => {
    const [pending, setPending] = useState(0);
    const [queueNumber, setQueueNumber] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPendingPatients = async () => {
            try {
                const count = await getPendingPatientsCount();
                const queue = await getActiveQueue();
                setPending(count);
                setQueueNumber(count > 0 && queue ? queue.id : null);
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
        if (queueNumber) {
            router.push(`/queue/${queueNumber}`);
        }
    };

    return (
        <button
            onClick={queueNumber ? handleClick : undefined}
            className={`relative flex items-center gap-2 p-2 rounded text-white transition-all duration-200
                ${pending > 0 ? "bg-primary-500 hover:bg-primary-600 cursor-pointer" : "bg-gray-400 cursor-default"}
            `}
            disabled={!queueNumber}
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
