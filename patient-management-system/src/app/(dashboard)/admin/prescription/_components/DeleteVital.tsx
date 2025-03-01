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
import {Trash2} from "lucide-react";
import {handleServerActionWithConfirmation} from "@/app/lib/utils";
import {deleteVital, safeDeleteVital} from "@/app/lib/actions/prescriptions";

interface DeleteVitalDialogProps {
    id: number;
}

const DeleteVitalDialog: React.FC<DeleteVitalDialogProps> = ({id}) => {
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {

        const userConfirmation = confirm('This will remove any unsaved prescription data. Are you sure you want to delete this vital?');

        if (!userConfirmation) {
            return;
        }

        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("prescription-form-")) {
                localStorage.removeItem(key);
            }
        });


        const result = await handleServerActionWithConfirmation(() => safeDeleteVital(id),
            () => deleteVital(id)
            , {
                loadingMessage: 'Deleting vital...',
            })
        if (result.success) {
            setOpen(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash2 className="w-5 h-5" color={'red'}/>
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
