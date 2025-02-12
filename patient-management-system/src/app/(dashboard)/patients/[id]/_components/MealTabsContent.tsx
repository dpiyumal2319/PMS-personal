import React, {useState} from 'react';
import {Card} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Clock} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {TabsContent} from "@/components/ui/tabs";
import MealCards from "@/app/(dashboard)/patients/[id]/_components/MealCards";
import type {MealStrategy} from "@/app/lib/definitions";

interface MealTabsContentProps {
    strategy: MealStrategy;
    setStrategy: React.Dispatch<React.SetStateAction<MealStrategy>>;
}

const MealTabsContent = ({strategy, setStrategy}: MealTabsContentProps) => {
    const [isLocked, setIsLocked] = useState(true);
    const [globalQuantity, setGlobalQuantity] = useState(0);


    const [isBeforeMeal, setIsBeforeMeal] = useState(true);

    const handleGlobalQuantityChange = (value: string) => {
        const quantity = Number(value);
        if (!isNaN(quantity)) {
            setGlobalQuantity(quantity);
            setStrategy(prev => ({
                ...prev,
                breakfast: {
                    ...prev.breakfast,
                    quantity
                },
                lunch: {
                    ...prev.lunch,
                    quantity
                },
                dinner: {
                    ...prev.dinner,
                    quantity
                }
            }))
        }
    };

    const handleIndividualQuantityChange = (meal: keyof Omit<MealStrategy, 'afterMeal' | 'minutesBeforeAfterMeal'>, value: string) => {
        if (!isLocked) {
            const quantity = Number(value);
            if (!isNaN(quantity)) {
                setStrategy(prev => ({
                    ...prev,
                    [meal]: {
                        ...prev[meal],
                        quantity
                    }
                }));
            }
        }
    };


    return (
        <TabsContent value="MEAL">
            <Card className="p-6 grid grid-cols-2 gap-6">
                {/* Left Column - Meal Selection + Global Input */}
                <Card className="p-4 space-y-4 bg-slate-50">
                    <MealCards
                        globalQuantity={globalQuantity}
                        strategy={strategy}
                        handleIndividualQuantityChange={handleIndividualQuantityChange}
                        isLocked={isLocked}
                        handleGlobalQuantityChange={handleGlobalQuantityChange}
                        setIsLocked={setIsLocked}
                    />
                </Card>

                {/* Right Column - Timing Controls */}
                <div className="space-y-4">
                    {/* Before/After Meal Switch */}
                    <Card className="bg-slate-50 p-4 rounded-lg">
                        <Label className="text-lg mb-4 block">Timing</Label>
                        <div className="flex items-center justify-center space-x-4">
                            <span
                                className={`text-sm font-medium transition-colors ${isBeforeMeal ? 'text-blue-600' : 'text-slate-500'}`}>
                                Before
                            </span>
                            <Switch
                                checked={!isBeforeMeal}
                                onCheckedChange={() => setIsBeforeMeal(!isBeforeMeal)}
                                className={`${
                                    !isBeforeMeal
                                        ? 'bg-green-600 data-[state=checked]:bg-green-600'
                                        : 'bg-blue-600 data-[state=unchecked]:bg-blue-600'
                                }`}
                            />
                            <span className={`text-sm font-medium transition-colors ${
                                !isBeforeMeal ? 'text-green-600' : 'text-slate-500'
                            }`}>
                                After
                            </span>
                        </div>
                    </Card>

                    {/* Minutes Input */}
                    <Card className="bg-slate-50 p-4 rounded-lg">
                        <Label htmlFor="minutes" className="text-sm text-slate-500 mb-2 block">
                            Minutes {isBeforeMeal ? 'before' : 'after'} meal
                        </Label>
                        <div className="relative">
                            <Input
                                id="minutes"
                                type="number"
                                className="text-lg pl-10"
                                placeholder="Enter minutes"
                            />
                            <Clock
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5"
                            />
                        </div>
                    </Card>
                </div>
            </Card>
        </TabsContent>
    );
};

export default MealTabsContent;
