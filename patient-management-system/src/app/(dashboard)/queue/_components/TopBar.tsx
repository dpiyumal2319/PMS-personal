"use client";

import React, {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {IoArrowBack} from "react-icons/io5";
import {getQueue} from "@/app/lib/actions";
import {FaStop} from "react-icons/fa";

const TopBar = () => {
    const pathname = usePathname();
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [status, setStatus] = useState<string>("COMPLETED");
    const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");

    let title = "All Queues";
    let showBackButton = false;
    let queueId = "1";

    if (pathname.startsWith("/queue/")) {
        queueId = pathname.split("/")[2];
        if (queueId) {
            title = `Queue ${queueId}`;
            showBackButton = true;
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const queueData = await getQueue(parseInt(queueId));

            if (queueData) {
                setStartTime(new Date(queueData.start));
                setStatus(queueData.status);
            }
        };

        fetchData();
    }, [queueId]);

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
            className="flex justify-between w-full bg-background-50 h-14 border-b border-primary-900/25 shadow p-2 items-center text-xl font-semibold text-gray-700">
            <div className="flex items-center">
                {showBackButton && (
                    <Link href="/queue" className="p-2 text-primary-900 hover:bg-gray-200 rounded-md">
                        <IoArrowBack className="size-6"/>
                    </Link>
                )}
                <p className="ml-2">{title}</p>
            </div>

            <div>
                {status === "COMPLETED" ? (
                    <span className="text-gray-600">Queue Completed</span>
                ) : (
                    <div className={'flex justify-end gap-4 items-center'}>
                        <span className="text-gray-900 font-medium">{elapsedTime}</span>
                        <button
                            className="p-3.5 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition"
                        >
                            <FaStop/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopBar;
