import React from 'react';
import {Card} from "@/components/ui/card";
import {
    AlertCircle,
    FileText
} from "lucide-react";
import {Batch, Drug, DrugBrand, Issue, OffRecordMeds} from "@prisma/client";
import {
    StrategyJsonSchema,
} from "@/app/lib/definitions";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {
    StrategyIcon,
    getStrategyBadgeColor,
    StrategyDetails
} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionIssuesList";

export interface IssueWithDetails extends Issue {
    drug: Drug;
    brand: DrugBrand,
    batch: Batch | null;
}

const PrescriptionIssueCard = ({issue}: { issue: IssueWithDetails }) => {
    if (!issue) {
        return <div className="text-center text-red-500 font-semibold">Issue not found</div>;
    }
    const strategy = StrategyJsonSchema.parse(issue.strategyDetails);

    return (
        <Card className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <div className="mt-1">
                        <StrategyIcon strategy={issue.strategy}/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{issue.drug.name}</h3>
                            <CustomBadge
                                text={issue.strategy}
                                color={getStrategyBadgeColor(issue.strategy)}
                            />
                        </div>
                        <div>
                            <span className="text-sm text-slate-500">{issue.details}</span>
                        </div>

                        <div className="text-sm text-slate-500">
                            Drug: {issue.drug.name} • Brand: {issue.brand.name} • batchID: {issue.batch?.id || 'N/A'} •
                            Quantity: {issue.quantity}
                        </div>
                        <StrategyDetails strategy={issue.strategy} details={strategy}/>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const OffRecordMedCard = ({med}: { med: OffRecordMeds }) => {
    if (!med) {
        return <div className="text-center text-red-500 font-semibold">Medicine not found</div>;
    }

    return (
        <Card className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <div className="mt-1">
                        <AlertCircle className="h-5 w-5 text-orange-500"/>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{med.name}</h3>
                        </div>
                        {med.description && (
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <FileText className="h-4 w-4"/>
                                <span>{med.description}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export {PrescriptionIssueCard, OffRecordMedCard};