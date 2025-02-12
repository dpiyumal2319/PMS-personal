"use client"

import { AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog,AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog';

const BatchStatusChangeButtonBar = ({ batchId } : {
    batchId: string;
}) => {
    const [action, setAction] = useState<"completed" | "trashed" | null>(null);

    const handleMarkAsCompleted = () => {
        setAction("completed");
    };

    const handleTrash = () => {
        setAction("trashed");
    };

    const handleConfirm = () => {
        if (action === "completed") {
            // Perform the "mark as completed" logic here
            console.log(`Batch ${batchId} marked as completed.`);
        } else if (action === "trashed") {
            // Perform the "trash" logic here
            console.log(`Batch ${batchId} trashed.`);
        }
    };

    return (
        <div className="flex justify-center gap-6 mt-6">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleMarkAsCompleted}>
                        Mark as Completed
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to mark this batch as completed?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirm}>Confirm</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" onClick={handleTrash}>
                        Trash
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to trash this batch?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirm}>Confirm</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BatchStatusChangeButtonBar;
