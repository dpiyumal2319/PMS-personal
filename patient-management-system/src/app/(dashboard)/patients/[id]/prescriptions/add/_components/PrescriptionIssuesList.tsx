import React from 'react';
import {Card} from "@/components/ui/card";
import {
    Pill,
    Clock,
    Calendar,
    AlertCircle,
    Info,
    X, FileText, Moon, Sun, Sunset, Milk, Tally3, Tally4, Tally2, Tally1
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {IssuingStrategy, MEAL} from "@prisma/client";
import type {DrugType} from "@prisma/client";
import type {
    IssueInForm,
    OffRecordMeds
} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {AlertDialogTitle} from "@radix-ui/react-alert-dialog";


export interface StrategyIconProps {
    strategy: IssuingStrategy;
}

export interface StrategyDetailsProps {
    strategy: IssuingStrategy;
    details: {
        strategy: string;
        dose: number;
        forDays: number | null;
        forTimes: number | null;
        meal: MEAL | null;
    };
}

// Tablet or Syrup
export const DrugIcon: React.FC<{ drugType: DrugType }> = ({drugType}) => {
    switch (drugType) {
        case 'Tablet':
            return <Pill
                className="text-green-600"
                size={20}
            />;
        case 'Syrup':
            return <Milk className="text-blue-600" size={20}/>;
        default:
            return null;
    }
}


export const getStrategyBadgeColor = (strategy: IssuingStrategy) => {
    switch (strategy) {
        case IssuingStrategy.TDS:
            return 'green';
        case IssuingStrategy.BD:
            return 'amber';
        case IssuingStrategy.OD:
            return 'blue';
        case IssuingStrategy.QDS:
            return 'yellow';
        case IssuingStrategy.SOS:
            return 'red';
        case IssuingStrategy.NOCTE:
            return 'indigo';
        case IssuingStrategy.MANE:
            return 'orange';
        case IssuingStrategy.VESPE:
            return 'pink';
        case IssuingStrategy.NOON:
            return 'gray';
        case IssuingStrategy.WEEKLY:
            return 'teal';
        case IssuingStrategy.OTHER:
            return 'purple';
        default:
            return 'gray';
    }
};

const strategyIconMap: Record<IssuingStrategy, React.ComponentType<{ className: string, size: number }>> = {
    [IssuingStrategy.TDS]: Tally3,
    [IssuingStrategy.BD]: Tally2,
    [IssuingStrategy.OD]: Tally1,
    [IssuingStrategy.QDS]: Tally4,
    [IssuingStrategy.SOS]: AlertCircle,
    [IssuingStrategy.NOCTE]: Moon,
    [IssuingStrategy.MANE]: Sun,
    [IssuingStrategy.VESPE]: Sunset,
    [IssuingStrategy.NOON]: Clock,
    [IssuingStrategy.WEEKLY]: Calendar,
    [IssuingStrategy.OTHER]: Info,
};

export const StrategyIcon: React.FC<StrategyIconProps> = ({strategy}) => {
    const IconComponent = strategyIconMap[strategy];
    if (!IconComponent) return null;

    return <IconComponent className={`text-${getStrategyBadgeColor(strategy)}-600`} size={18}/>;
};

function formatMeal(meal: MEAL | null) {
    switch (meal) {
        case MEAL.BEFORE:
            return <span className="font-semibold text-red-600">before meal</span>;
        case MEAL.AFTER:
            return <span className="font-semibold text-green-600">after meal</span>;
        case MEAL.WITH:
            return <span className="font-semibold text-blue-600">with meal</span>;
        default:
            return null;
    }
}

export const StrategyDetails: React.FC<StrategyDetailsProps> = ({ strategy, details }) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <StrategyIcon strategy={strategy} /> {/* Adding the StrategyIcon here */}
                {(() => {
                    const highlightedDose = <span className="font-bold text-green-700">{details.dose} units</span>;

                    switch (strategy) {
                        case IssuingStrategy.TDS:
                        case IssuingStrategy.BD:
                        case IssuingStrategy.OD:
                        case IssuingStrategy.QDS:
                        case IssuingStrategy.NOCTE:
                        case IssuingStrategy.MANE:
                        case IssuingStrategy.VESPE:
                        case IssuingStrategy.NOON:
                            return (
                                <span>
                                    {details.strategy} - {highlightedDose} for {details.forDays} days {formatMeal(details.meal)}
                                </span>
                            );
                        case IssuingStrategy.SOS:
                            return (
                                <span>
                                    {details.strategy} - {highlightedDose} as needed for {details.forTimes} times {formatMeal(details.meal)}
                                </span>
                            );
                        case IssuingStrategy.WEEKLY:
                            return (
                                <span>
                                    Weekly: {highlightedDose} × {details.forTimes} times {formatMeal(details.meal)}
                                </span>
                            );
                        case IssuingStrategy.OTHER:
                            return (
                                <span>
                                    {details.strategy} - {highlightedDose} × {details.forTimes} days {formatMeal(details.meal)}
                                </span>
                            );
                        default:
                            return null;
                    }
                })()}
            </div>
        </div>
    );
};

export interface PrescriptionIssuesListProps {
    issues: IssueInForm[];
    onRemove: (index: number) => void;
}

const PrescriptionIssuesList: React.FC<PrescriptionIssuesListProps> = ({issues, onRemove}) => {
    return (
        <div className="space-y-4">
            {issues.map((issue, index) => (
                <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="mt-1">
                                <DrugIcon drugType={issue.drugType}/>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-medium">{issue.drugName} - {issue.concentration} mg/unit - </h3>
                                    <CustomBadge
                                        text={issue.strategy} color={getStrategyBadgeColor(issue.strategy)}/>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-500">{issue.details}</span>
                                </div>

                                <div className="text-sm text-slate-500">
                                    Drug: {issue.drugName} • Concentration: {issue.concentration} mg/unit •
                                    Brand: {issue.brandName} • Quantity: {issue.quantity}
                                </div>
                                <StrategyDetails strategy={issue.strategy} details={issue}/>
                            </div>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-500 hover:text-red-600"
                                >
                                    <X className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Medicine {index + 1}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to remove {issue.drugName} ({issue.brandName}) from
                                        the
                                        list? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onRemove(index)}
                                                       className={'bg-red-600 text-white hover:bg-red-700'}>
                                        Remove
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </Card>
            ))}
        </div>
    );
};


interface OffRecordMedsListProps {
    meds: OffRecordMeds[];
    onRemove: (index: number) => void;
}

const OffRecordMedsList: React.FC<OffRecordMedsListProps> = ({meds, onRemove}) => {
    return (
        <div className="space-y-3">
            {meds.map((med, index) => (
                <Card key={index} className="p-4">
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
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-500 hover:text-red-600"
                                >
                                    <X className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Medication?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to remove {med.name} from the list?
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onRemove(index)}
                                                       className={'bg-red-600 text-white hover:bg-red-700'}>
                                        Remove
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export {PrescriptionIssuesList, OffRecordMedsList};