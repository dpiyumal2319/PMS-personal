'use client';

import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip";
import {FaStop, FaTrash, FaMedkit} from "react-icons/fa";
import {toast} from "react-toastify";
import {removePatientFromQueue} from "@/app/lib/actions";
import {IoIosMore} from "react-icons/io";

// Remove from Queue Button
const RemoveFromQueue = ({token, queueId}: { token: number, queueId: number }) => {
    const handleRemove = () => {
        toast.promise(
            removePatientFromQueue(queueId, token),
            {
                pending: 'Removing patient from queue...',
                success: 'Patient removed successfully!',
                error: {
                    render({data}) {
                        return data instanceof Error ? data.message : 'An error occurred';
                    }
                }
            },
            {
                position: 'bottom-right',
                className: 'ring ring-gray-500/25',
            }
        ).catch((e) => console.error(e));
    };

    return (
        <AlertDialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <button className="p-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition">
                            <FaTrash/>
                        </button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    Remove from Queue
                </TooltipContent>
            </Tooltip>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove from the Queue</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove this patient from the queue? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
                        Keep in Queue
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleRemove}
                        className="bg-red-600 text-white hover:bg-red-700"
                    >
                        Remove from Queue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

// Prescribe Button (For Doctors)
const PrescribeMedicine = () => {
    const handlePrescribe = () => {
        toast.success('Prescription issued successfully!', {
            position: 'bottom-right',
            className: 'ring ring-gray-500/25',
        });
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={handlePrescribe}
                    className="p-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                >
                    <FaMedkit/>
                </button>
            </TooltipTrigger>
            <TooltipContent>
                Prescribe Medicine
            </TooltipContent>
        </Tooltip>
    );
};

// Issue Medicine Button (For Pharmacists)
const IssueMedicine = () => {
    const handleIssue = () => {
        toast.success('Medicine issued successfully!', {
            position: 'bottom-right',
            className: 'ring ring-gray-500/25',
        });
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={handleIssue}
                    className="p-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                >
                    <FaStop/>
                </button>
            </TooltipTrigger>
            <TooltipContent>
                Issue Medicine
            </TooltipContent>
        </Tooltip>
    );
};

const ViewProfile = ({id}: { id: number }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button className="flex items-center p-2 text-gray-500 rounded hover:bg-gray-200 transition"
                        onClick={() => {
                            console.log('Viewing profile of patient with ID:', id);
                        }}>
                    <IoIosMore className={'font-bold text-lg'}/>
                </button>
            </TooltipTrigger>
            <TooltipContent>
                View Profile
            </TooltipContent>
        </Tooltip>
    )
}

export {RemoveFromQueue, PrescribeMedicine, IssueMedicine, ViewProfile};