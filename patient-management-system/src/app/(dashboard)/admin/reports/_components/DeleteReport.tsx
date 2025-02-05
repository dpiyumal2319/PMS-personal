'use client';

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog";
import {Trash} from "lucide-react";
import {handleServerAction} from "@/app/lib/utils";
import {deleteReportType} from "@/app/lib/actions";
import {Button} from "@/components/ui/button";
import React, {useState, useEffect} from "react";

export function DeleteReport({id}: { id: number }) {
    const handleDelete = async () => {
        await handleServerAction(() => deleteReportType(id), {
            loadingMessage: 'Removing from Queue...'
        });
    }

    const [countdown, setCountdown] = useState(5);
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setDisabled(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000); // Changed from 3000 to 1000 for 1-second intervals

        return () => clearInterval(interval);
    }, []);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                >
                    <Trash className="h-4 w-4 text-red-600"/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete report template?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the report template along with all
                        <span className="text-red-600"> associated <span
                            className={'font-bold'}>parameters</span> and <span
                            className={'font-bold'}>patient reports</span></span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}
                                       disabled={disabled}>
                        {disabled ? `Delete all data (${countdown})` : "Delete all data"}
                    </AlertDialogAction>
                    <AlertDialogCancel className="bg-green-600 text-white hover:bg-green-700 hover:text-white">
                        Keep
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}