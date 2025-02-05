'use client';

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import {handleServerAction} from "@/app/lib/utils";
import {deleteReportType} from "@/app/lib/actions";

export function DeleteReport({id}: {id:number}) {
    const handleDelete = async () => {
        await handleServerAction(() => deleteReportType(id), {
            loadingMessage: 'Removing from Queue...'
        });
    }


    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="text-red-600 hover:text-red-800 p-2 rounded">
                    <Trash className="w-5 h-5" />
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete report template?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the report template.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                        Keep
                    </AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
