import React, {useState} from 'react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    FileX,
    Hourglass,
    MoreHorizontal,
    ShieldAlert,
    Utensils,
} from "lucide-react";
import {Card} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import MealTabsContent from "@/app/(dashboard)/patients/[id]/_components/MealTabsContent";
import {IssueingStrategy} from "@prisma/client";
import type {
    MealStrategy,
    StrategyJson,
    OtherStrategy,
    WhenNeededStrategy,
    PeriodicStrategy,
    OffRecordStrategy
} from "@/app/lib/definitions";

interface MedicationStrategyTabsProps {
    onStrategyChange: (strategy: IssueingStrategy, newStrategyData: StrategyJson) => void;
}

const MedicationStrategyTabs = ({onStrategyChange}: MedicationStrategyTabsProps) => {
    const [mealStrategy, setMealStrategy] = useState<MealStrategy>({
        dinner: {
            active: false,
            quantity: 0
        },
        breakfast: {
            active: false,
            quantity: 0
        },
        lunch: {
            active: false,
            quantity: 0
        },
        afterMeal: false,
        minutesBeforeAfterMeal: 0
    });

    const [whenNeededStrategy, setWhenNeededStrategy] = useState<WhenNeededStrategy>({
        quantity: 0
    });

    const [periodicStrategy, setPeriodicStrategy] = useState<PeriodicStrategy>({
        interval: 0,
        quantity: 0
    });

    const [offRecordStrategy, setOffRecordStrategy] = useState<OffRecordStrategy>({
        details: "",
        quantity: 0
    });

    const [otherStrategy, setOtherStrategy] = useState<OtherStrategy>({
        details: "",
        quantity: 0
    });

    const handleTabChange = (strategy: IssueingStrategy) => {
        switch (strategy) {
            case IssueingStrategy.MEAL:
                onStrategyChange(strategy,
                    {
                        name: IssueingStrategy.MEAL,
                        strategy: mealStrategy
                    });
                break;
            case IssueingStrategy.WHEN_NEEDED:
                onStrategyChange(strategy, {
                    name: IssueingStrategy.WHEN_NEEDED,
                    strategy: whenNeededStrategy
                });
                break;
            case IssueingStrategy.PERIODIC:
                onStrategyChange(strategy, {
                    name: IssueingStrategy.PERIODIC,
                    strategy: periodicStrategy
                });
                break;
            case IssueingStrategy.OFF_RECORD:
                onStrategyChange(strategy, {
                    name: IssueingStrategy.OFF_RECORD,
                    strategy: offRecordStrategy
                });
                break;
            case IssueingStrategy.ORTHER:
                onStrategyChange(strategy, {
                    name: IssueingStrategy.OTHER,
                    strategy: otherStrategy
                });
                break;
        }
    }

    return (
        <Tabs defaultValue="MEAL" className="w-full max-w-3xl mx-auto" onValueChange={(value) => handleTabChange(value as IssueingStrategy)}>
            <div className="h-10 mb-6">
                <TabsList className="w-full">
                    <TabsTrigger value={IssueingStrategy.MEAL} className="flex items-center space-x-2">
                        <Utensils className="w-4 h-4"/> <span>Meal</span>
                    </TabsTrigger>
                    <TabsTrigger value={IssueingStrategy.WHEN_NEEDED} className="flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4"/> <span>When Needed</span>
                    </TabsTrigger>
                    <TabsTrigger value={IssueingStrategy.PERIODIC} className="flex items-center space-x-2">
                        <Hourglass className="w-4 h-4"/> <span>Periodically</span>
                    </TabsTrigger>
                    <TabsTrigger value={IssueingStrategy.OFF_RECORD} className="flex items-center space-x-2">
                        <FileX className="w-4 h-4"/> <span>Off Record</span>
                    </TabsTrigger>
                    <TabsTrigger value={IssueingStrategy.ORTHER} className="flex items-center space-x-2">
                        <MoreHorizontal className="w-4 h-4"/> <span>Other</span>
                    </TabsTrigger>
                </TabsList>
            </div>

            <MealTabsContent strategy={mealStrategy} setStrategy={setMealStrategy}/>

            <TabsContent value="WHEN_NEEDED">
                <Card className="p-6">
                    <div className="space-y-2">
                        <Label htmlFor="when-needed" className="text-sm text-slate-500">Specify when needed
                            conditions</Label>
                        <Input
                            id="when-needed"
                            type="text"
                            className="text-lg"
                            placeholder="When needed details"
                        />
                    </div>
                </Card>
            </TabsContent>

            <TabsContent value="PERIODIC">
                <Card className="p-6">
                    <div className="space-y-2">
                        <Label htmlFor="periodic" className="text-sm text-slate-500">Specify periodic schedule</Label>
                        <Input
                            id="periodic"
                            type="text"
                            className="text-lg"
                            placeholder="Periodic details"
                        />
                    </div>
                </Card>
            </TabsContent>

            <TabsContent value="OFF_RECORD">
                <Card className="p-6">
                    <div className="space-y-2">
                        <Label htmlFor="off-record" className="text-sm text-slate-500">Off record medication
                            details</Label>
                        <Input
                            id="off-record"
                            type="text"
                            className="text-lg"
                            placeholder="Off record details"
                        />
                    </div>
                </Card>
            </TabsContent>

            <TabsContent value="OTHER">
                <Card className="p-6">
                    <div className="space-y-2">
                        <Label htmlFor="other" className="text-sm text-slate-500">Other medication details</Label>
                        <Input
                            id="other"
                            type="text"
                            className="text-lg"
                            placeholder="Other details"
                        />
                    </div>
                </Card>
            </TabsContent>
        </Tabs>
    );
};

export default MedicationStrategyTabs;