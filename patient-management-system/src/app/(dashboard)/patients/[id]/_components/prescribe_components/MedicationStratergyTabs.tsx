import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    Hourglass,
    MoreHorizontal,
    ShieldAlert,
    Utensils,
} from "lucide-react";
import {
    MealTabsContent,
    WhenNeededContent,
    OtherTabsContent,
    PeriodicTabsContent
} from "@/app/(dashboard)/patients/[id]/_components/prescribe_components/TabsContent";
import {IssueingStrategy} from "@prisma/client";
import type {
    MealStrategy,
    OtherStrategy,
    WhenNeededStrategy,
    PeriodicStrategy,
} from "@/app/lib/definitions";
import React from "react";

interface MedicationStrategyTabsProps {
    selectedStrategy: {
        selectedStrategy: IssueingStrategy | null,
        setSelectedStrategy: React.Dispatch<React.SetStateAction<IssueingStrategy | null>>
    }
    mealStrategy: {
        mealStrategy: MealStrategy,
        setMealStrategy: React.Dispatch<React.SetStateAction<MealStrategy>>
    },
    whenNeededStrategy: {
        whenNeededStrategy: WhenNeededStrategy,
        setWhenNeededStrategy: React.Dispatch<React.SetStateAction<WhenNeededStrategy>>
    },
    periodicStrategy: {
        periodicStrategy: PeriodicStrategy,
        setPeriodicStrategy: React.Dispatch<React.SetStateAction<PeriodicStrategy>>
    },
    otherStrategy: {
        otherStrategy: OtherStrategy,
        setOtherStrategy: React.Dispatch<React.SetStateAction<OtherStrategy>>
    }
}

const MedicationStrategyTabs = ({selectedStrategy, mealStrategy, periodicStrategy, otherStrategy, whenNeededStrategy, }: MedicationStrategyTabsProps) => {

    const handleTabChange = (strategy: IssueingStrategy) => {
        switch (strategy) {
            case IssueingStrategy.MEAL:
                selectedStrategy.setSelectedStrategy(IssueingStrategy.MEAL);
                break;
            case IssueingStrategy.WHEN_NEEDED:
                selectedStrategy.setSelectedStrategy(IssueingStrategy.WHEN_NEEDED);
                break;
            case IssueingStrategy.PERIODIC:
                selectedStrategy.setSelectedStrategy(IssueingStrategy.PERIODIC);
                break;
            case IssueingStrategy.OTHER:
                selectedStrategy.setSelectedStrategy(IssueingStrategy.OTHER);
                break;
        }
    }

    return (
        <Tabs defaultValue="MEAL" className="w-full mx-auto" value={selectedStrategy.selectedStrategy ? selectedStrategy.selectedStrategy : ''}
              onValueChange={(value) => handleTabChange(value as IssueingStrategy)}>
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

            <MealTabsContent strategy={mealStrategy.mealStrategy} setStrategy={mealStrategy.setMealStrategy}/>
            <WhenNeededContent strategy={whenNeededStrategy.whenNeededStrategy} setStrategy={whenNeededStrategy.setWhenNeededStrategy}/>
            <PeriodicTabsContent strategy={periodicStrategy.periodicStrategy} setStrategy={periodicStrategy.setPeriodicStrategy}/>
            <OtherTabsContent strategy={otherStrategy.otherStrategy} setStrategy={otherStrategy.setOtherStrategy}/>
        </Tabs>
    );
};

export default MedicationStrategyTabs;