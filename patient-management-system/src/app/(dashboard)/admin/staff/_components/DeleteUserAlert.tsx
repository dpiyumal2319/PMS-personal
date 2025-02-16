'use client';

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {handleServerAction} from "@/app/lib/utils";
import {deleteUser} from "@/app/lib/actions";
import {useEffect, useState} from "react";

export default function DeleteUserDialog({id}: { id: number }) {
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


    const handleDelete = async () => {
        await handleServerAction(() => deleteUser(id), {
            loadingMessage: "Deleting user...",
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size={'sm'}>Delete User</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user from our records.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={disabled} onClick={handleDelete}
                                       className={'bg-red-600 text-white hover:bg-red-700'}>
                        Delete {countdown > 0 ? `(${countdown})` : ''}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
