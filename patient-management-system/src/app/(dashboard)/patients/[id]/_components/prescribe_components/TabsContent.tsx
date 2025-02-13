import React, {useState} from 'react';
import {Card} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {AlertCircle, Clock, Calendar} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {TabsContent} from "@/components/ui/tabs";
import MealCards from "@/app/(dashboard)/patients/[id]/_components/prescribe_components/MealCards";
import type {
    MealStrategy,
    OffRecordStrategy,
    OtherStrategy,
    PeriodicStrategy,
    WhenNeededStrategy
} from "@/app/lib/definitions";

interface MealTabsContentProps {
    strategy: MealStrategy;
    setStrategy: React.Dispatch<React.SetStateAction<MealStrategy>>;
}

const MealTabsContent = ({strategy, setStrategy}: MealTabsContentProps) => {
    const [isLocked, setIsLocked] = useState(true);
    const [globalQuantity, setGlobalQuantity] = useState(0);

    const handleGlobalQuantityChange = (value: string) => {
        const dose = Number(value);
        if (!isNaN(dose)) {
            setGlobalQuantity(dose);
            setStrategy(prev => ({
                ...prev,
                breakfast: {
                    ...prev.breakfast,
                    dose
                },
                lunch: {
                    ...prev.lunch,
                    dose
                },
                dinner: {
                    ...prev.dinner,
                    dose
                }
            }))
        }
    };

    const handleIndividualQuantityChange = (meal: keyof Omit<MealStrategy, 'afterMeal' | 'minutesBeforeAfterMeal' | 'forDays'>, value: string) => {
        if (!isLocked) {
            const dose = Number(value);
            if (!isNaN(dose)) {
                setStrategy(prev => ({
                    ...prev,
                    [meal]: {
                        ...prev[meal],
                        dose
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
                        setStrategy={setStrategy}
                        handleIndividualQuantityChange={handleIndividualQuantityChange}
                        isLocked={isLocked}
                        handleGlobalQuantityChange={handleGlobalQuantityChange}
                        setIsLocked={setIsLocked}
                    />
                </Card>

                {/* Right Column - Timing Controls */}
                <div className="space-y-4 flex flex-col justify-evenly">
                    {/* Before/After Meal Switch */}
                    <Card className="bg-slate-50 p-4 rounded-lg">
                        <Label className="text-lg mb-4 block">Timing</Label>
                        <div className="flex items-center justify-center space-x-4 transition-colors">
                            <span
                                className={`text-sm font-medium transition-colors ${!strategy.afterMeal ? 'text-blue-600' : 'text-slate-500'}`}>
                                Before
                            </span>
                            <Switch
                                checked={strategy.afterMeal}
                                onCheckedChange={(checked) => setStrategy(prev => ({...prev, afterMeal: checked}))}
                                className={`${
                                    strategy.afterMeal
                                        ? 'bg-green-600 data-[state=checked]:bg-green-600'
                                        : 'bg-blue-600 data-[state=unchecked]:bg-blue-600'
                                }`}
                            />
                            <span className={`text-sm font-medium transition-colors ${
                                strategy.afterMeal ? 'text-green-600' : 'text-slate-500'
                            }`}>
                                After
                            </span>
                        </div>
                    </Card>

                    {/* Minutes Input */}
                    <Card className="bg-slate-50 p-4 rounded-lg">
                        <Label htmlFor="minutes" className="text-sm text-slate-500 mb-2 block">
                            Minutes {!strategy.afterMeal ? 'before' : 'after'} meal
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

                    {/* Days Input */}
                    <Card className="bg-slate-50 p-4 rounded-lg">
                        <Label htmlFor="days" className="text-sm text-slate-500 mb-2 block">
                            Days
                        </Label>
                        <Input
                            id="days"
                            value={strategy.forDays}
                            type="number"
                            onChange={(e) => setStrategy(prev => ({...prev, forDays: Number(e.target.value)}))}
                            className="text-lg"
                            placeholder="Enter days"
                        />
                    </Card>
                </div>
            </Card>
        </TabsContent>
    );
};

interface WhenNeededContentProps {
    strategy: WhenNeededStrategy;
    setStrategy: React.Dispatch<React.SetStateAction<WhenNeededStrategy>>;
}

// When Needed Tab
const WhenNeededContent = ({strategy, setStrategy}: WhenNeededContentProps) => {
    const handleQuantityChange = (value: string) => {
        const quantity = Number(value);
        if (!isNaN(quantity)) {
            setStrategy(prev => ({
                ...prev,
                quantity
            }));
        }
    }


    return (
        <TabsContent value="WHEN_NEEDED">
            <Card className="p-6">
                <div className="space-y-2">
                    <Label className="text-sm text-slate-500">Quantity</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={strategy.quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            className="text-lg pl-10"
                            placeholder="Enter quantity"
                        />
                        <AlertCircle
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5"
                        />
                    </div>
                </div>
            </Card>
        </TabsContent>
    );
};

interface PeriodicTabsContentProps {
    strategy: PeriodicStrategy;
    setStrategy: React.Dispatch<React.SetStateAction<PeriodicStrategy>>;
}

const PeriodicTabsContent = ({ strategy, setStrategy }: PeriodicTabsContentProps) => {
    const handleChange = (field: keyof PeriodicStrategy) => (value: string) => {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
            setStrategy(prev => ({
                ...prev,
                [field]: numValue
            }));
        }
    };

    return (
        <TabsContent value="PERIODIC">
            <Card className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm text-slate-500">Interval</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={strategy.interval}
                            onChange={(e) => handleChange('interval')(e.target.value)}
                            className="text-lg pl-10"
                            placeholder="Enter interval"
                        />
                        <Clock
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm text-slate-500">Dose</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={strategy.dose}
                            onChange={(e) => handleChange('dose')(e.target.value)}
                            className="text-lg pl-10"
                            placeholder="Enter quantity"
                        />
                        <AlertCircle
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm text-slate-500">For days</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={strategy.forDays}
                            onChange={(e) => handleChange('forDays')(e.target.value)}
                            className="text-lg pl-10"
                            placeholder="Enter for days"
                        />
                        <Calendar
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5"
                        />
                    </div>
                </div>
            </Card>
        </TabsContent>
    );
};

interface OffRecordTabsContentProps {
    strategy: OffRecordStrategy;
    setStrategy: React.Dispatch<React.SetStateAction<OffRecordStrategy>>;
}

const OffRecordTabsContent = ({strategy, setStrategy}: OffRecordTabsContentProps) => {
    const handleQuantityChange = (value: string) => {
        const quantity = Number(value);
        if (!isNaN(quantity)) {
            setStrategy(prev => ({
                ...prev,
                quantity
            }));
        }
    };

    return (
        <TabsContent value="OFF_RECORD">
            <Card className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm text-slate-500">Quantity</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={strategy.quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            className="text-lg pl-10"
                            placeholder="Enter quantity"
                        />
                        <AlertCircle
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm text-slate-500">Details</Label>
                    <Input
                        type="text"
                        value={strategy.details}
                        onChange={(e) => setStrategy(prev => ({ ...prev, details: e.target.value }))}
                        className="text-lg"
                        placeholder="Enter details"
                    />
                </div>
            </Card>
        </TabsContent>
    );
};

interface OtherTabsContentProps {
    strategy: OtherStrategy;
    setStrategy: React.Dispatch<React.SetStateAction<OtherStrategy>>;
}

const OtherTabsContent = ({ strategy, setStrategy }: OtherTabsContentProps) => {
    const handleQuantityChange = (value: string) => {
        const quantity = Number(value);
        if (!isNaN(quantity)) {
            setStrategy(prev => ({
                ...prev,
                quantity
            }));
        }
    };

    return (
        <TabsContent value="OTHER">
            <Card className="p-6 space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm text-slate-500">Quantity</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={strategy.quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            className="text-lg pl-10"
                            placeholder="Enter quantity"
                        />
                        <AlertCircle
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-sm text-slate-500">Details</Label>
                    <Input
                        type="text"
                        value={strategy.details}
                        onChange={(e) => setStrategy(prev => ({ ...prev, details: e.target.value }))}
                        className="text-lg"
                        placeholder="Enter details"
                    />
                </div>
            </Card>
        </TabsContent>
    );
};

export {MealTabsContent, WhenNeededContent, PeriodicTabsContent, OffRecordTabsContent, OtherTabsContent};