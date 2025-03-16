'use client';

import React, {useEffect, useState} from 'react';
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {SheetTrigger, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription} from "@/components/ui/sheet";
import {
    getActiveQueuePatients,
    queuePatients,
    getPendingPatientsCount
} from "@/app/lib/actions/queue";
import {ScrollArea} from "@/components/ui/scroll-area";
import PatientsList from "@/app/(dashboard)/_components/topbar/CompactPatientsList";
import {redirect} from "next/navigation";
import {RefreshCw} from "lucide-react";

type Patients = Awaited<ReturnType<typeof queuePatients>>;

const PendingPatients = () => {
    const [pending, setPending] = useState({total: 0, pending: 0});
    const [open, setOpen] = useState(false);
    const [patients, setPatients] = useState<Patients | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPendingPatients = async () => {
        try {
            const count = await getPendingPatientsCount();
            setPending(count);
        } catch (error) {
            console.error("Failed to fetch pending patients count:", error);
        }
    };

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const data = await getActiveQueuePatients();
            setPatients(data);
        } catch (error) {
            console.error("Failed to fetch pending patients:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchPendingPatients().then();

        // Set interval to refetch every 45 seconds
        const interval = setInterval(fetchPendingPatients, 45000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (open) {
            fetchPatients().then();
        }
    }, [open]);

    const handleRefresh = () => {
        fetchPatients().then();
        fetchPendingPatients().then();
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    onClick={() => setOpen(true)}
                    variant="ghost"
                    className={cn(
                        "relative h-8 px-3 text-sm font-medium transition-colors",
                        pending.total > 0
                            ? "text-blue-600 bg-blue-100 hover:bg-blue-200"
                            : "text-gray-500"
                    )}
                >
                    {pending.total > 0 && (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"/>
                    )}
                    {pending.total > 0 ? `${pending.pending} / ${pending.total} Assigned` : "No Assigned"}
                </Button>
            </SheetTrigger>
            <SheetContent className={'h-screen flex flex-col w-[30rem]'}>
                <SheetHeader className="flex-shrink-0">
                    <div className="flex gap-2 items-center">
                        <SheetTitle>Assigned Patients</SheetTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="h-8 w-8 p-0"
                        >
                            <RefreshCw
                                className={cn(
                                    "h-4 w-4",
                                    isLoading && "animate-spin"
                                )}
                            />
                            <span className="sr-only">Refresh</span>
                        </Button>
                    </div>
                    <SheetDescription>All assigned patients in the queue</SheetDescription>
                </SheetHeader>
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium text-gray-900">{pending.total}</span>
                        <span className="text-gray-500">in outside</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500">Assigned:</span>
                        <span className="font-medium text-blue-600">{pending.pending}</span>
                        <span className="text-gray-500">to you</span>
                    </div>
                </div>
                <ScrollArea className={'flex-1 mt-2'}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-32 space-y-2">
                            <div
                                className="h-8 w-8 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"/>
                            <p className="text-sm text-gray-500">Loading patients...</p>
                        </div>
                    ) : patients && patients.length > 0 ? (
                        <PatientsList patients={patients} closeSheet={() => setOpen(false)}/>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                            <p>No patients found in the queue</p>
                        </div>
                    )}
                </ScrollArea>
                <div className="flex-shrink-0 pt-4 pb-2">
                    <Button
                        className="w-full"
                        onClick={() => {
                            setOpen(false);
                            redirect('/queue/active');
                        }}
                    >
                        View full queue
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default PendingPatients;