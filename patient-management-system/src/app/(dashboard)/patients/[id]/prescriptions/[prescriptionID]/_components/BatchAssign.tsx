'use client';

import React, {useState} from 'react';
import {
    IssueWithDetails,
} from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/MedicineCards";
import AssignBatchCard
    from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/AssignBatchCard";
import {Button} from "@/components/ui/button";
import {toast} from "react-toastify";
import {calculateBill} from "@/app/lib/actions";
import {Bill} from "@/app/lib/definitions";
import {BillComponent} from "@/app/(dashboard)/_components/Bill";

export type BatchAssignment = {
    issueID: number;
    batchID: number | null;
}

export type BatchAssignPayload = {
    prescriptionID: number;
    patientID: number;
    batchAssigns: BatchAssignment[];
}

const BatchAssign = ({issues, prescriptionID, patientID}: {
        issues: IssueWithDetails[],
        prescriptionID: number,
        patientID: number
    }) => {
        const [batchAssignments, setBatchAssignments] = useState<BatchAssignment[]>(
            issues.map(issue => ({
                issueID: issue.id,
                batchID: null
            }))
        );
        const [error, setError] = useState<string | null>(null);
        const [bill, setBill] = useState<Bill | null>(null);

        const handleBatchAssign = (issueID: number, batchID: number | null) => {
            setBatchAssignments(prev => prev.map(assignment =>
                assignment.issueID === issueID
                    ? {...assignment, batchID}
                    : assignment
            ));
        };

        const submitBatchAssignments = async () => {
            // Verify that all issues have been assigned a batch
            if (batchAssignments.some(assignment => assignment.batchID === null)) {
                setError('Please assign all batches before submitting');
                return;
            }

            const payload: BatchAssignPayload = {
                prescriptionID,
                patientID,
                batchAssigns: batchAssignments
            };

            const id = toast.loading('Getting Bill Ready...', {position: 'bottom-right', pauseOnFocusLoss: false});

            const result = await calculateBill({prescriptionData: payload});
            if (result.success && result.bill) {
                setError(null);
                setBill(result.bill);
                toast.update(id, {
                    render: 'Bill generated successfully!',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000,
                    closeOnClick: true
                });
            } else {
                toast.update(id, {
                    render: result.message,
                    type: 'error',
                    isLoading: false,
                    autoClose: 2000,
                    closeOnClick: true
                });
                setError(result.message);
            }
        };
        return (
            <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="flex justify-start items-center">
                    <span className="text-lg font-semibold">Assign relevant Batches</span>
                </div>
                {issues.map((issue) => (
                    <AssignBatchCard
                        key={issue.id}
                        issue={issue}
                        onBatchAssign={(batchID) => handleBatchAssign(issue.id, batchID)}
                    />
                ))}

                <div className="flex justify-between items-center">
                    <div className="text-red-500">{error}</div>
                    <Button
                        onClick={submitBatchAssignments}
                    >
                        Generate Bill
                    </Button>
                </div>

                {bill && <BillComponent bill={bill}/>}
            </div>
        );
    }
;

export default BatchAssign;