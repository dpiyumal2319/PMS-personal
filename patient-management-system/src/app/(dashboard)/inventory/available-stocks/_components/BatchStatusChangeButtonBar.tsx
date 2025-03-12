"use client";

import { AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { IoMdDoneAll } from 'react-icons/io';
import { FaTrashAlt } from 'react-icons/fa';
import { handleConfirmationOfBatchStatusChange } from '@/app/lib/actions';
import { useRouter } from 'next/navigation'; // Import useRouter

const BatchStatusChangeButtonBar = ({ batchId }: { batchId: string }) => {
    const [action, setAction] = useState<"completed" | "disposed" | "quality_failed"| "available"| null>(null);
    const [completedOpen, setCompletedOpen] = useState(false);
    const [trashedOpen, setTrashedOpen] = useState(false);
    const router = useRouter(); // Initialize useRouter

    const handleConfirm = async () => {
        if (action) {
            await handleConfirmationOfBatchStatusChange(Number(batchId), action);
            router.refresh(); // Refresh the page
        }
    };

    return (
        <div className="flex justify-center gap-4">
            <AlertDialog open={completedOpen} onOpenChange={setCompletedOpen}>
                <AlertDialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setCompletedOpen(true); setAction("completed"); }}>
                        <IoMdDoneAll className="mr-2" />
                        Mark as Completed
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to mark this batch as completed?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setCompletedOpen(false)}>
                            <AiOutlineClose className="mr-2" /> Cancel
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={async () => {
                            await handleConfirm();
                            setCompletedOpen(false);
                        }}>
                            <AiOutlineCheck className="mr-2" /> Confirm
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={trashedOpen} onOpenChange={setTrashedOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" onClick={() => { setTrashedOpen(true); setAction("disposed"); }}>
                        <FaTrashAlt className="mr-2" />
                        Dispose
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to trash this batch?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setTrashedOpen(false)}>
                            <AiOutlineClose className="mr-2" /> Cancel
                        </Button>
                        <Button variant="destructive" onClick={async () => {
                            await handleConfirm();
                            setTrashedOpen(false);
                        }}>
                            <AiOutlineCheck className="mr-2" /> Confirm
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BatchStatusChangeButtonBar;
