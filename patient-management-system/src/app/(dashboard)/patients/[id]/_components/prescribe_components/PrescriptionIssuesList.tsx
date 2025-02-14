import React from 'react';
import {Card} from "@/components/ui/card";
import {
    Pill,
    Clock,
    Calendar,
    AlertCircle,
    Utensils,
    Timer,
    Repeat,
    Info,
    X, FileText
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {IssueingStrategy} from "@prisma/client";
import {MealStrategy, OtherStrategy, PeriodicStrategy, WhenNeededStrategy} from "@/app/lib/definitions";
import type {
    IssueInForm,
    OffRecordMeds
} from "@/app/(dashboard)/patients/[id]/_components/prescribe_components/PrescriptionForm";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {AlertDialogTitle} from "@radix-ui/react-alert-dialog";

interface StrategyDetails {
    name: IssueingStrategy;
    strategy: MealStrategy | WhenNeededStrategy | PeriodicStrategy | OtherStrategy;
}

interface StrategyIconProps {
    strategy: IssueingStrategy;
}

interface StrategyDetailsProps {
    strategy: IssueingStrategy;
    details: StrategyDetails;
}

const StrategyIcon: React.FC<StrategyIconProps> = ({strategy}) => {
    switch (strategy) {
        case IssueingStrategy.MEAL:
            return <Utensils className="h-5 w-5 text-green-600"/>;
        case IssueingStrategy.WHEN_NEEDED:
            return <AlertCircle className="h-5 w-5 text-amber-600"/>;
        case IssueingStrategy.PERIODIC:
            return <Repeat className="h-5 w-5 text-blue-600"/>;
        case IssueingStrategy.OTHER:
            return <Info className="h-5 w-5 text-purple-600"/>;
        default:
            return null;
    }
};

const StrategyDetails: React.FC<StrategyDetailsProps> = ({strategy, details}) => {
    switch (strategy) {
        case IssueingStrategy.MEAL: {
            const mealStrategy = details.strategy as MealStrategy;
            return (
                <div className="space-y-2">
                    <div className="flex space-x-3">
                        {mealStrategy.breakfast.active && (
                            <CustomBadge text={`Morning: ${mealStrategy.breakfast.dose}`}
                                         color={'fuchsia'}/>
                        )}
                        {mealStrategy.lunch.active && (
                            <CustomBadge text={`Afternoon: ${mealStrategy.lunch.dose}`}
                                         color={'cyan'}/>
                        )}
                        {mealStrategy.dinner.active && (
                            <CustomBadge text={`Evening: ${mealStrategy.dinner.dose}`}
                                         color={'pink'}/>
                        )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4"/>
                        <span>{mealStrategy.minutesBeforeAfterMeal} mins {mealStrategy.afterMeal ? 'after' : 'before'} meal</span>
                        <Calendar className="h-4 w-4 ml-2"/>
                        <span>for {mealStrategy.forDays} days</span>
                    </div>
                </div>
            );
        }
        case IssueingStrategy.WHEN_NEEDED: {
            const whenNeededStrategy = details.strategy as WhenNeededStrategy;
            return (
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Pill className="h-4 w-4"/>
                    <span>{whenNeededStrategy.dose} units</span>
                    <Timer className="h-4 w-4 ml-2"/>
                    <span>up to {whenNeededStrategy.times} times</span>
                </div>
            );
        }
        case IssueingStrategy.PERIODIC: {
            const periodicStrategy = details.strategy as PeriodicStrategy;
            return (
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4"/>
                    <span>Every {periodicStrategy.interval} hours</span>
                    <Pill className="h-4 w-4 ml-2"/>
                    <span>{periodicStrategy.dose} units</span>
                    <Calendar className="h-4 w-4 ml-2"/>
                    <span>for {periodicStrategy.forDays} days</span>
                </div>
            );
        }
        case IssueingStrategy.OTHER: {
            const otherStrategy = details.strategy as OtherStrategy;
            return (
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Info className="h-4 w-4"/>
                    <span>{otherStrategy.details}</span>
                    <Pill className="h-4 w-4 ml-2"/>
                    <span>{otherStrategy.dose} units × {otherStrategy.times} times</span>
                </div>
            );
        }
        default:
            return null;
    }
};

const getStrategyBadgeColor = (strategy: IssueingStrategy) => {
    switch (strategy) {
        case IssueingStrategy.MEAL:
            return 'green'
        case IssueingStrategy.WHEN_NEEDED:
            return 'amber'
        case IssueingStrategy.PERIODIC:
            return 'blue'
        case IssueingStrategy.OTHER:
            return 'purple'
        default:
            return 'gray';
    }
}


interface PrescriptionIssuesListProps {
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
                                <StrategyIcon strategy={issue.strategy}/>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-medium">{issue.drugName}</h3>
                                    <CustomBadge
                                        text={issue.strategy}
                                        color={getStrategyBadgeColor(issue.strategy)}
                                    />
                                </div>
                                <div className="text-sm text-slate-500">
                                    Drug: {issue.drugName} • Brand: {issue.brandName}  • Quantity: {issue.quantity}
                                </div>
                                <StrategyDetails strategy={issue.strategy} details={issue.strategyDetails}/>
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
                                        Are you sure you want to remove {issue.drugName} ({issue.brandName}) from the
                                        list?
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
                                    <AlertDialogAction onClick={() => onRemove(index)} className={'bg-red-600 text-white hover:bg-red-700'}>
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