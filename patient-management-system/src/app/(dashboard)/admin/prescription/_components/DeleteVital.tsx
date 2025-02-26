'use client';

import React, {useState} from 'react';
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
import {Button} from "@/components/ui/button";
import {Trash} from "lucide-react";
import {handleServerAction} from "@/app/lib/utils";
import {deleteVital} from "@/app/lib/actions/prescriptions";

interface DeleteVitalDialogProps {
    id: number;
}

const DeleteVitalDialog: React.FC<DeleteVitalDialogProps> = ({id}) => {
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        const result = await handleServerAction(() => deleteVital(id), {
            loadingMessage: 'Deleting vital...',
        })
        if (result) {
            setOpen(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash className="w-5 h-5" color={'red'}/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Vital</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this vital? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteVitalDialog;
