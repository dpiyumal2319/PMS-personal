"use client";

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    IssueWithDetails,
    PrescriptionIssueCard
} from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/MedicineCards";
import {Card, CardContent} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {getBatches, getCachedBatch} from "@/app/lib/actions";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {formatDistanceToNow} from 'date-fns';
import {Button} from "@/components/ui/button";
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
import {AlertCircle} from "lucide-react"; // Added for warning icon

interface AssignBatchCardProps {
    issue: IssueWithDetails;
    onBatchAssign: (batchID: number | null) => void;
}

type Batches = Awaited<ReturnType<typeof getBatches>>;

const AssignBatchCard = ({issue, onBatchAssign}: AssignBatchCardProps) => {
    const [batches, setBatches] = useState<Batches | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

    const fetchAndUpdateBatches = useCallback(async () => {
        console.log('Fetching batches for drug:', issue.drugId, 'brand:', issue.brandId);
        const batches = await getBatches({drugID: issue.drugId, brandID: issue.brandId});
        setBatches(batches);

        const cachedBatch = await getCachedBatch({drugId: issue.drugId, brandId: issue.brandId});
        const batchIDs = batches.map(batch => batch.id);

        if (cachedBatch && batchIDs.includes(cachedBatch.batchId)) {
            setSelectedBatch(cachedBatch.batchId);
        }
    }, [issue.drugId, issue.brandId]);

    useEffect(() => {
        fetchAndUpdateBatches().then();
    }, [fetchAndUpdateBatches]);

    // In AssignBatchCard component
    const prevSelectedBatchRef = useRef(selectedBatch);

    useEffect(() => {
        if (selectedBatch !== prevSelectedBatchRef.current) {
            onBatchAssign(selectedBatch);
            prevSelectedBatchRef.current = selectedBatch;
        }
    }, [selectedBatch, onBatchAssign]);

    const handleComplete = async () => {
        if (selectedBatch !== null) {
            console.log('Marking batch as out of stock:', selectedBatch);
            setSelectedBatch(null);

            // Refetch batches after marking as complete
            await fetchAndUpdateBatches();
        }
    };

    const handleSelect = (batchId: string) => {
        setSelectedBatch(Number(batchId));
    };

    return (
        <div className={'flex gap-4'}>
            <PrescriptionIssueCard issue={issue}/>
            <Card className={'w-1/2 p-4'}>
                <CardContent className="flex flex-col gap-4">
                    <Select onValueChange={handleSelect} value={selectedBatch ? `${selectedBatch}` : ''}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a batch"/>
                        </SelectTrigger>
                        <SelectContent>
                            {batches?.map((batch) => (
                                <SelectItem key={batch.id} value={`${batch.id}`} className={'p-4'}>
                                    <div className={'flex justify-between gap-4 items-center w-full'}>
                                        <span className={'font-semibold'}>#{batch.id}</span>
                                        <div className="flex gap-2">
                                            <CustomBadge
                                                text={`${batch.remainingQuantity} left`}
                                                color={batch.remainingQuantity < 50 ? "red" : batch.remainingQuantity < 150 ? "yellow" : "blue"}
                                            />
                                            <CustomBadge
                                                text={`Expires in: ${formatDistanceToNow(batch.expiry)}`}
                                                color={new Date(batch.expiry).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 30
                                                    ? "red"
                                                    : new Date(batch.expiry).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 90
                                                        ? "yellow"
                                                        : "blue"
                                                }
                                            />
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/*Buttons*/}
                    <div className={'flex gap-4 justify-end'}>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    disabled={!selectedBatch}
                                    className={`${!selectedBatch && "opacity-50 cursor-not-allowed"}`}
                                >
                                    <AlertCircle className="mr-2 h-4 w-4"/>
                                    {selectedBatch ? `Mark Batch #${selectedBatch} as Out of Stock` : "Select a batch to mark as out of stock"}
                                </Button>
                            </AlertDialogTrigger>
                            {selectedBatch && (
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-600">Mark Batch #{selectedBatch} as Out of
                                            Stock?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will mark the batch as completely out of stock. This action cannot be
                                            undone and will affect inventory calculations.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleComplete}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Mark as Out of Stock
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            )}
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AssignBatchCard;