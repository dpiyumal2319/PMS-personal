import React from 'react';
import {Card} from "@/components/ui/card";
import {
    AlertCircle,
    FileText
} from "lucide-react";
import {Batch, Drug, DrugBrand, Issue, OffRecordMeds, UnitConcentration} from "@prisma/client";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {
    getStrategyStyles, DrugIcon, StrategyDetails,
} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionIssuesList";
import {calculateForDays, calculateTimes} from "@/app/lib/utils";

export interface IssueWithDetails extends Issue {
    drug: Drug;
    brand: DrugBrand,
    batch: Batch | null;
    unitConcentration: UnitConcentration;
}

const PrescriptionIssueCard = ({issue}: { issue: IssueWithDetails }) => {
    if (!issue) {
        return <div className="text-center text-red-500 font-semibold">Issue not found</div>;
    }

    const cardStyles = getStrategyStyles(issue.strategy);

    return (
        <Card
            className={`p-4 flex-grow overflow-hidden border-l-4 ${cardStyles.borderColor}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <div className="mt-1">
                        <DrugIcon drugType={issue.type}/>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{issue.drug.name} - {issue.unitConcentration.concentration} mg/unit</h3>
                            <CustomBadge
                                text={issue.strategy}
                                color={cardStyles.badgeColor}
                            />
                        </div>
                        <div className="text-sm text-slate-600 flex flex-wrap items-center gap-1">
                            <div>
                                <span className="font-medium text-slate-500">Drug: </span>
                                <span className="text-gray-900 font-semibold">{issue.drug.name}</span>
                            </div>
                            <span className="text-gray-400">|</span>
                            <div>
                                <span className="font-medium text-slate-500">Brand: </span>
                                <span className="text-gray-900 font-semibold">{issue.brand.name}</span>
                            </div>
                            {issue.batch?.id && (
                                <>
                                    <span className="text-gray-400">|</span>
                                    <div>
                                        <span className="font-medium text-slate-500">Batch #: </span>
                                        <span className="text-gray-900 font-semibold">{issue.batch.number}</span>
                                    </div>
                                </>
                            )}
                            <span className="text-gray-400">|</span>
                            <div>
                                <span className="font-medium text-slate-500">Quantity: </span>
                                <span className="text-gray-900 font-semibold">{issue.quantity}</span>
                            </div>
                        </div>
                        <StrategyDetails strategy={issue.strategy} details={{
                            strategy: issue.strategy,
                            dose: issue.dose,
                            meal: issue.meal,
                            forDays: calculateForDays({
                                strategy: issue.strategy,
                                dose: issue.dose,
                                quantity: issue.quantity
                            }),
                            forTimes: calculateTimes({
                                strategy: issue.strategy,
                                dose: issue.dose,
                                quantity: issue.quantity
                            }),
                        }}/>
                        <div>
                            <span className="text-sm text-slate-500">{issue.details}</span>
                        </div>
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
        <Card className="p-4 flex-grow overflow-hidden border-l-4 border-l-slate-500">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <div className="mt-1">
                        <AlertCircle className="h-5 w-5 text-slate-500"/>
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