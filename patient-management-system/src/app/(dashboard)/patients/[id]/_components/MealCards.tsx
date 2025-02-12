import React from "react";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Coffee, Moon, UtensilsCrossed, Lock, Unlock, LucideIcon} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import type {MealStrategy} from "@/app/lib/definitions";

interface mealConfig {
    id: keyof Omit<MealStrategy, 'afterMeal' | 'minutesBeforeAfterMeal'>;
    label: string;
    icon: LucideIcon;
    iconColor: string;
}


const MEALS_CONFIG: mealConfig[] = [
    {
        id: "breakfast",
        label: "Breakfast",
        icon: Coffee,
        iconColor: "text-orange-500",
    },
    {
        id: "lunch",
        label: "Lunch",
        icon: UtensilsCrossed,
        iconColor: "text-green-500",
    },
    {
        id: "dinner",
        label: "Dinner",
        icon: Moon,
        iconColor: "text-blue-500",
    },
];

const MealCards = ({
                       globalQuantity,
                       strategy,
                       handleIndividualQuantityChange,
                       handleGlobalQuantityChange,
                       isLocked,
                       setIsLocked,
                   }: {
    globalQuantity: number;
    strategy: MealStrategy;
    handleIndividualQuantityChange: (meal: keyof Omit<MealStrategy, 'afterMeal' | 'minutesBeforeAfterMeal'>, value: string) => void;
    handleGlobalQuantityChange: (value: string) => void;
    isLocked: boolean;
    setIsLocked: (value: boolean) => void;
}) => {
    return (
        <div className="space-y-4">
            {/* Global Quantity Input */}
            <div>
                <Label htmlFor="global-quantity" className="text-sm text-slate-500 mb-2 block">
                    Quantity per meal
                </Label>
                <div className="relative">
                    <Input
                        id="global-quantity"
                        type="number"
                        className="text-lg pr-12"
                        placeholder="Set quantity for all meals"
                        value={globalQuantity}
                        onChange={(e) => handleGlobalQuantityChange(e.target.value)}
                        disabled={!isLocked}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setIsLocked(!isLocked)}
                    >
                        {isLocked ? (
                            <Lock className="h-4 w-4 text-slate-500"/>
                        ) : (
                            <Unlock className="h-4 w-4 text-slate-500"/>
                        )}
                    </Button>
                </div>
            </div>

            {/* Individual Meal Inputs */}
            {MEALS_CONFIG.map(({id, label, icon: Icon, iconColor}) => (
                <div
                    key={id}
                    className="bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                    <div className="flex items-center space-x-4">
                        <Checkbox id={id} className="h-6 w-6 rounded-md border-2" defaultChecked/>
                        <Label htmlFor={id} className="flex items-center space-x-3 text-lg">
                            <Icon className={`h-5 w-5 ${iconColor}`}/>
                            <span>{label}</span>
                        </Label>
                    </div>
                    <Input
                        type="number"
                        className="w-24 text-lg"
                        placeholder="Qty"
                        value={strategy[id].quantity}
                        onChange={(e) => handleIndividualQuantityChange(id, e.target.value)}
                        disabled={isLocked}
                    />
                </div>
            ))}
        </div>
    );
};

export default MealCards;
