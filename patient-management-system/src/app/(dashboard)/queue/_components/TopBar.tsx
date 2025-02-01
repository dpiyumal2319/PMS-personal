"use client";

import React, {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {IoArrowBack} from "react-icons/io5";
import {getQueue} from "@/app/lib/actions";
import {FaStop} from "react-icons/fa";
import {stopQueue} from "@/app/lib/actions";
import {toast} from "react-toastify";
import { MdOutlineTimer } from "react-icons/md";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TopBar = () => {
    const pathname = usePathname();
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [status, setStatus] = useState<string>("COMPLETED");
    const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");

    let title = "All Queues";
    let perQueuePageActive = false;
    let queueId = null;

    if (pathname.startsWith("/queue/")) {
        queueId = pathname.split("/")[2];
        if (queueId) {
            title = `Queue ${queueId}`;
            perQueuePageActive = true;
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!queueId) {
                return;
            }
            const queueData = await getQueue(parseInt(queueId));

            if (queueData) {
                setStartTime(new Date(queueData.start));
                setStatus(queueData.status);
            }
        };

        fetchData().then(() => {});
    }, [queueId]);


    const handleStop = async () => {
        await toast.promise(
            stopQueue(queueId),
            {
                pending: 'Stopping queue...',
                success: 'Queue stopped successfully',
                error: {
                    render({data}) {
                        return data instanceof Error ? data.message : 'An error occurred';
                    }
                },
            },
            {
                position: 'bottom-right',
                className: 'ring ring-gray-500/25',
            }
        )

        setStatus("COMPLETED");
    }

    useEffect(() => {
        if (status === "IN_PROGRESS" && startTime) {
            const updateElapsedTime = () => {
                const now = new Date();
                const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);

                const hours = Math.floor(diff / 3600).toString().padStart(2, "0");
                const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
                const seconds = (diff % 60).toString().padStart(2, "0");

                setElapsedTime(`${hours}:${minutes}:${seconds}`);
            };

            updateElapsedTime();
            const interval = setInterval(updateElapsedTime, 1000);

            return () => clearInterval(interval);
        }
    }, [status, startTime]);

    return (
        <div
            className="flex justify-between w-full bg-background-50 border-b border-primary-900/25 shadow py-3.5 px-3 items-center text-xl font-semibold text-gray-800">
            <div className="flex items-center">
                {perQueuePageActive && (
                    <Link href="/queue" className="p-2 hover:bg-gray-200 rounded-md">
                        <IoArrowBack className="size-6"/>
                    </Link>
                )}
                <p className="ml-2">{title}</p>
            </div>

            {perQueuePageActive &&
                <div>
                    {status === "COMPLETED" ? (
                        <span className="text-gray-600">Queue Completed</span>
                    ) : (
                        <div className={'flex gap-2 items-center'}>
                            <MdOutlineTimer className="text-2xl text-gray-500 w-full"/>
                            <div className={'flex justify-center m-auto min-w-24'}>
                                <span className="font-medium">{elapsedTime}</span>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button
                                        className="p-3.5 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition"
                                    >
                                        <FaStop/>
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Stop Queue</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to stop this queue? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">Keep Running</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleStop}
                                            className="bg-red-600 text-white hover:bg-red-700"
                                        >
                                            Stop Queue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>}
        </div>
    );
};

export default TopBar;