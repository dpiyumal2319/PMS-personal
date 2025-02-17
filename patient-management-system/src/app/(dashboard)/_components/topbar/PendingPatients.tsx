'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {getPendingPatientsCount} from "@/app/lib/actions";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

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

        // Set interval to refetch every 45 seconds
        const interval = setInterval(fetchPendingPatients, 45000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    const handleClick = () => {
        router.push(`/queue/active`);
    };

    return (
        <Button
            onClick={handleClick}
            variant="ghost"
            className={cn(
                "relative h-8 px-3 text-sm font-medium transition-colors",
                pending > 0
                    ? "text-blue-600 bg-blue-100 hover:bg-blue-200"
                    : "text-gray-500"
            )}
            disabled={pending === 0}
        >
            {pending > 0 && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"/>
            )}
            {pending > 0 ? `${pending} Patients` : "No Patients"}
        </Button>
    );
};

export default PendingPatients;
