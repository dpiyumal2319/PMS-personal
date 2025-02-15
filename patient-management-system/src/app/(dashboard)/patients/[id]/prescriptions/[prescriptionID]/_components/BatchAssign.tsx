'use client';

import React, {useState} from 'react';
import {
    IssueWithDetails,
} from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/MedicineCards";
import AssignBatchCard
    from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/AssignBatchCard";
import {Button} from "@/components/ui/button";

export type BatchAssignment = {
    issueID: number;
    batchID: number | null;
}

export type BatchAssignPayload = {
    prescriptionID: number;
    batchAssigns: BatchAssignment[];
}

const BatchAssign = ({issues, prescriptionID}: { issues: IssueWithDetails[], prescriptionID: number }) => {
    const [batchAssignments, setBatchAssignments] = useState<BatchAssignment[]>(
        issues.map(issue => ({
            issueID: issue.id,
            batchID: null
        }))
    );
    const [error, setError] = useState<string | null>(null);

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
            batchAssigns: batchAssignments
        };

        console.log('Submitting batch assignments:', payload);
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

            <div className="flex justify-between">
                <div className="text-red-500">{error}</div>
                <Button
                    onClick={submitBatchAssignments}
                >
                    Submit Assignments
                </Button>
            </div>
        </div>
    );
};

export default BatchAssign;