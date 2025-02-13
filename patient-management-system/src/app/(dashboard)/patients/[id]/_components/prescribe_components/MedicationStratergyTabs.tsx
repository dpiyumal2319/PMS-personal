import React, {useState} from 'react';
import {Tabs,TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    Hourglass,
    MoreHorizontal,
    ShieldAlert,
    Utensils,
} from "lucide-react";
import {MealTabsContent, WhenNeededContent, OtherTabsContent, PeriodicTabsContent} from "@/app/(dashboard)/patients/[id]/_components/prescribe_components/TabsContent";
import {IssueingStrategy} from "@prisma/client";
import type {
    MealStrategy,
    StrategyJson,
    OtherStrategy,
    WhenNeededStrategy,
    PeriodicStrategy,
} from "@/app/lib/definitions";

interface MedicationStrategyTabsProps {
    onStrategyChange: (strategy: IssueingStrategy, newStrategyData: StrategyJson) => void;
}

const MedicationStrategyTabs = ({onStrategyChange}: MedicationStrategyTabsProps) => {
    const [mealStrategy, setMealStrategy] = useState<MealStrategy>({
        dinner: {
            active: true,
            dose: 0
        },
        breakfast: {
            active: true,
            dose: 0
        },
        lunch: {
            active: true,
            dose: 0
        },
        forDays: 0,
        afterMeal: true,
        minutesBeforeAfterMeal: 0
    });

    const [whenNeededStrategy, setWhenNeededStrategy] = useState<WhenNeededStrategy>({
        quantity: 0
    });

    const [periodicStrategy, setPeriodicStrategy] = useState<PeriodicStrategy>({
        interval: 0,
        dose: 0,
        forDays: 0
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
            case IssueingStrategy.OTHER:
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
                    <TabsTrigger value={IssueingStrategy.OTHER} className="flex items-center space-x-2">
                        <MoreHorizontal className="w-4 h-4"/> <span>Other</span>
                    </TabsTrigger>
                </TabsList>
            </div>

            <MealTabsContent strategy={mealStrategy} setStrategy={setMealStrategy}/>
            <WhenNeededContent strategy={whenNeededStrategy} setStrategy={setWhenNeededStrategy}/>
            <PeriodicTabsContent strategy={periodicStrategy} setStrategy={setPeriodicStrategy} />
            <OtherTabsContent strategy={otherStrategy} setStrategy={setOtherStrategy}/>
        </Tabs>
    );
};

export default MedicationStrategyTabs;