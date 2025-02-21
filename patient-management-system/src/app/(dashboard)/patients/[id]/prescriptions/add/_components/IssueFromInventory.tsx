'use client';

import React, {useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useDebouncedCallback} from "use-debounce";
import {
    getCachedStrategy,
    searchAvailableDrugs,
    getWeightByBrand,
    getBrandByDrugWeightType, getDrugTypesByDrug
} from "@/app/lib/actions/prescriptions";
import DrugCombobox from "./DrugCombobox";
import BrandCombobox from "./BrandCombobox";
import MedicationStrategyTabs from "./MedicationStratergyTabs";
import {Button} from "@/components/ui/button";
import {DrugType, IssuingStrategy, MEAL} from "@prisma/client";
import type {IssueInForm} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";
import {calculateForDays, calculateQuantity} from "@/app/lib/utils";
import {ClipboardCheck, Plus, Utensils} from "lucide-react";
import {Textarea} from "@/components/ui/textarea";
import {differenceInDays} from "date-fns";
import WeightComboBox from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/WeightComboBox";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Switch} from "@/components/ui/switch";
import DrugTypeComboBox from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/DrugTypeCombobox";

interface IssuesListProps {
    onAddIssue: (issue: IssueInForm) => void;
}

export type DrugOption = {
    id: number;
    name: string;
    weightCount: number;
}

export type CustomDrugType = {
    name: string,
    type: DrugType
}

export interface WeightOption {
    id: number;
    weight: string;
    brandCount: number;
    totalRemainingQuantity: number;
    farthestExpiry: Date;
}

export interface BrandOption {
    id: number;
    name: string;
    batchCount: number;
    totalRemainingQuantity: number;
    farthestExpiry: Date;
}

type CachedStrategy = Awaited<ReturnType<typeof getCachedStrategy>>

const IssueFromInventory: React.FC<IssuesListProps> = ({onAddIssue}) => {
    const [open, setOpen] = useState(false);
    const [isDrugSearching, setIsDrugSearching] = useState(false);
    const [isBrandSearching, setIsBrandSearching] = useState(false);
    const [isWeightSearching, setIsWeightSearching] = useState(false);

    const [drugs, setDrugs] = useState<DrugOption[]>([]);
    const [selectedDrug, setSelectedDrug] = useState<DrugOption | null>(null);

    const [types, setTypes] = useState<CustomDrugType[]>([]);
    const [selectedType, setSelectedType] = useState<CustomDrugType | null>(null);

    const [weights, setWeights] = useState<WeightOption[]>([]);
    const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null);

    const [brands, setBrands] = useState<BrandOption[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<BrandOption | null>(null);

    const [details, setDetails] = useState<string>("");

    const [strategy, setStrategy] = useState<IssuingStrategy | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const [dose, setDose] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number | null>(null);
    const [times, setTimes] = useState<number | null>(null);
    const [forDays, setForDays] = useState<number | null>(null);
    const [mealTiming, setMealTiming] = useState<MEAL | null>(null);


    const handleDoseChange = (value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setDose(numValue);
        }
    };

    const handleForDaysChange = (value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setForDays(numValue);
        }
    };

    const handleTimesChange = (value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setQuantity(numValue);
        }
    };

    const resetForm = () => {
        setSelectedDrug(null);
        setSelectedWeight(null);
        setSelectedBrand(null);
        setDetails("");
        setError(null);
        setWarning(null);
        setStrategy(null);
        setDose(null);
        setQuantity(null);
        setTimes(null);
        setForDays(null);
        setMealTiming(null);
        setSelectedType('Tablet');
    };

    const showWarnings = (item: WeightOption | BrandOption) => {
        const expiry = item.farthestExpiry;
        const remainingQuantity = item.totalRemainingQuantity;
        const daysUntilExpiry = differenceInDays(new Date(expiry), new Date());

        if (daysUntilExpiry < 120 && remainingQuantity < 150) {
            setWarning(`Warning: Expiry in ${daysUntilExpiry} days (${expiry}) and stock is ${remainingQuantity} units`);
        } else if (daysUntilExpiry < 120) {
            setWarning(`Warning: Expiry in ${daysUntilExpiry} days (${expiry})`);
        } else if (remainingQuantity < 150) {
            setWarning(`Warning: Current stock is ${remainingQuantity} units`);
        } else {
            setWarning(null);
        }
    };

    const handleDrugSearch = useDebouncedCallback(async (term: string) => {
        setIsDrugSearching(true);
        try {
            const drugs = await searchAvailableDrugs(term);
            setDrugs(drugs);
        } catch (error) {
            setError("Error searching drugs");
            console.error(error);
        } finally {
            setIsDrugSearching(false);
        }
    }, 700);

    const handleDrugSelect = async (selected: DrugOption) => {
        if (selected === selectedDrug) return;

        try {
            // Reset states before fetching new data
            setSelectedDrug(selected);
            setIsBrandSearching(true);
            setIsWeightSearching(true);

            // Clear previous selections
            setSelectedWeight(null);
            setSelectedBrand(null);
            setStrategy(null);
            setDose(null);
            setForDays(null);
            setMealTiming(null);
            setDetails("");
            setTimes(null);

            // Fetch initial data
            const [cachedStrategy, types] = await Promise.all([
                getCachedStrategy(selected.id),
                getDrugTypesByDrug(selected.id),
            ]);

            console.log(types);

            if (!types.length) {
                throw new Error("No drug types available");
            }

            setTypes(types);

            // Check if cached drug type is valid
            const hasValidCachedType =
                cachedStrategy && types.some(type => type.name === cachedStrategy.lastDrugType);

            if (!hasValidCachedType) {
                console.warn("No valid cached drug type found, stopping further fetching.");
                return; // **Early exit**
            }

            const selectedDrugType = cachedStrategy.lastDrugType;
            const newSelect = types.find(type => type.type === selectedDrugType) || null;
            setSelectedType(newSelect);

            // Fetch weights
            if (!newSelect) {
                return; // **Early exit**
            }

            const weights = await getWeightByBrand({
                drugID: selected.id,
                type: newSelect,
            });

            setWeights(weights);

            const cachedWeightID = cachedStrategy?.weight?.id;
            const isValidCachedWeight = cachedWeightID && weights.some(weight => weight.id === cachedWeightID);

            if (isValidCachedWeight) {
                const cachedWeight: WeightOption = weights.find(weight => weight.id === cachedWeightID)!;
                setSelectedWeight(cachedWeight);
                showWarnings(cachedWeight);

                // Fetch brands
                const drugBrands = await getBrandByDrugWeightType({
                    drugID: selected.id,
                    weightID: cachedWeightID,
                    type: selectedDrugType,
                });

                setBrands(drugBrands);
                await handleCachedBrandStrategy(drugBrands, cachedStrategy);
            } else {
                // No valid cached weight, stop fetching brands
                setWeights(weights);
                setBrands([]);
            }
        } catch (error) {
            console.error("Error in handleDrugSelect:", error);
            setError(error instanceof Error ? error.message : "Error fetching drug data");

            // Reset states on error
            setBrands([]);
            setWeights([]);
            setSelectedWeight(null);
            setSelectedBrand(null);
        } finally {
            setIsBrandSearching(false);
            setIsWeightSearching(false);
        }
    };

    // Helper function to handle cached brand strategy
    const handleCachedBrandStrategy = async (
        drugBrands: BrandOption[],
        cachedStrategy: CachedStrategy
    ) => {
        if (!cachedStrategy) return;

        const availableBrandIDs = drugBrands.map(brand => brand.id);

        if (availableBrandIDs.includes(cachedStrategy.brand.id)) {
            const {brand, issue} = cachedStrategy;

            // Set brand information
            setSelectedBrand(drugBrands.find(b => b.id === brand.id) || null);
            // Set issue details
            setStrategy(issue.strategy);
            setDose(issue.dose);
            setMealTiming(issue.meal);
            setDetails(issue.strategy);

            // Handle OTHER strategy specific logic
            if (issue.strategy === IssuingStrategy.OTHER || issue.strategy === IssuingStrategy.SOS) {
                const {quantity, dose} = issue;
                setTimes(dose > 0 && quantity != null ? quantity / dose : null);
            } else {
                setForDays(calculateForDays({strategy: issue.strategy, dose: issue.dose, quantity: issue.quantity}));
            }

            // Show warnings if applicable
            const selectedBrand = drugBrands.find(b => b.id === brand.id);
            if (selectedBrand) {
                showWarnings(selectedBrand);
            }
        } else {
            // Reset strategy-related states if cached brand is not available
            setStrategy(null);
            setDose(null);
            setForDays(null);
            setMealTiming(null);
            setDetails("");
            setTimes(null);
        }
    };

    const handleTypeSelect = async (type: CustomDrugType) => {
        if (!selectedDrug) return;
        try {
            setSelectedType(type);
            setIsBrandSearching(true);
            setIsWeightSearching(true);

            // Reset previous selections
            setSelectedWeight(null);
            setSelectedBrand(null);
            setBrands([]);
            setWeights([]);

            // For tablets, first fetch weights
            const weights = await getWeightByBrand({
                drugID: selectedDrug.id,
                type: type
            });

            console.log(weights);

            setWeights(weights);
            setIsWeightSearching(false);
        } catch (error) {
            console.error('Error in handleTypeSelect:', error);
            setError(error instanceof Error ? error.message : "Error fetching drug data");

            // Reset states on error
            setBrands([]);
            setWeights([]);
            setSelectedWeight(null);
            setSelectedBrand(null);
        } finally {
            setIsBrandSearching(false);
            setIsWeightSearching(false);
        }
    };

    const handleWeightSelect = async (selected: WeightOption) => {
        setSelectedWeight(selected);
        if (!selectedWeight || !selectedDrug) return;
        showWarnings(selectedWeight);
        try {
            const drugBrands = await getBrandByDrugWeightType({
                drugID: selectedDrug.id,
                weightID: selected.id,
                type: selectedType,
            });
            setBrands(drugBrands);
        } catch (error) {
            console.error(error);
            setError("Error fetching brands");
        }

    };

    const handleBrandSelect = (selected: BrandOption) => {
        setSelectedBrand(selected);
        if (selectedBrand) {
            showWarnings(selectedBrand);
        }
    };

    const handleAddIssue = () => {
        // if (!selectedDrug || !selectedBrand || !strategy || !selectedDrugName || !selectedBrandName || !selectedWeight) {
        //     const missingFields = [
        //         !selectedDrug && "Drug",
        //         !selectedWeight && "Weight",
        //         !selectedBrand && "Brand",
        //         !strategy && "Strategy"
        //     ].filter(Boolean);
        //
        //     setError(`Please fill all required fields: ${missingFields.join(", ")}`);
        //     return;
        // }
        //
        // const calculatedQuantity = calculateQuantity({
        //     dose: dose || 0,
        //     strategy,
        //     forDays: forDays || 0,
        //     times: times || 0
        // });
        //
        // const newIssue: IssueInForm = {
        //     drugId: selectedDrug,
        //     drugName: selectedDrugName,
        //     details,
        //     brandId: selectedBrand,
        //     brandName: selectedBrandName,
        //     strategy,
        //     dose: dose || 0,
        //     forDays: forDays || 0,
        //     quantity: calculatedQuantity,
        //     meal: mealTiming,
        //     forTimes: times || 0,
        // };
        //
        // onAddIssue(newIssue);
        // setOpen(false);
        // resetForm();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Card
                    className="border-dashed border-2 p-4 flex justify-center items-center cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 group">
                    <div className="flex items-center space-x-2 text-slate-500 group-hover:text-slate-800">
                        <Plus className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"/>
                        <span className="font-medium">Issue from Inventory</span>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-5xl overflow-y-auto max-h-screen overflow-x-visible">
                <DialogHeader>
                    <DialogTitle>Add Issue</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                        <DrugCombobox
                            options={drugs}
                            onChange={(drug) => handleDrugSelect(drug)}
                            onSearch={handleDrugSearch}
                            isSearching={isDrugSearching}
                            value={selectedDrug}
                            placeholder="Select drug"
                            searchPlaceholder="Search drug"
                            noOptionsMessage="No drugs found"
                        />
                        <div className={'flex gap-4'}>
                            <DrugTypeComboBox
                                options={types}
                                onChange={(type) => handleTypeSelect(type)}
                                value={selectedType}
                                placeholder={'Select a type'}
                                noOptionsMessage={'No types'}
                                disabled={!selectedDrug}
                            />
                            <WeightComboBox
                                options={weights}
                                onChange={(weight) => handleWeightSelect(weight)}
                                isSearching={isWeightSearching}
                                value={selectedWeight}
                                placeholder="Select weight"
                                noOptionsMessage="No weights found"
                                searchPlaceholder="Search weights"
                                disabled={!selectedDrug}
                            />
                        </div>
                        <BrandCombobox
                            options={brands}
                            onChange={(id) => handleBrandSelect(id)}
                            isSearching={isBrandSearching}
                            value={selectedBrand}
                            placeholder="Select brand"
                            searchPlaceholder="Search brand"
                            noOptionsMessage="No brands found"
                            disabled={!selectedType}
                        />
                    </div>

                    <div className="flex justify-between">
                        <span className="text-red-500 text-sm">{warning}</span>
                        <span className="text-red-500 text-sm">{error}</span>
                        <button
                            onClick={resetForm}
                            className="text-red-500 cursor-pointer text-sm hover:underline"
                        >
                            X Clear
                        </button>
                    </div>

                    <MedicationStrategyTabs
                        selectedStrategy={{
                            selectedStrategy: strategy,
                            setSelectedStrategy: setStrategy
                        }}
                    />

                    {/* Dosage & Duration Card */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Dosage & Duration Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <ClipboardCheck className="h-6 w-6 text-blue-500"/>
                                    <span>Dosage & Duration</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dose">Dosage</Label>
                                        <Input
                                            id="dose"
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={dose || ""}
                                            onChange={(e) => handleDoseChange(e.target.value)}
                                            placeholder="Enter dosage"
                                        />
                                    </div>

                                    <div
                                        key={strategy} // This forces a re-render when strategy changes
                                        className="space-y-2 transition-all duration-300 animate-fade-in"
                                    >
                                        {strategy && strategy !== IssuingStrategy.SOS && strategy !== IssuingStrategy.OTHER ? (
                                            <>
                                                <Label htmlFor="forDays">For Days</Label>
                                                <Input
                                                    id="forDays"
                                                    type="number"
                                                    min="0"
                                                    value={forDays || ""}
                                                    onChange={(e) => handleForDaysChange(e.target.value)}
                                                    placeholder="Enter number of days"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Label htmlFor="times">For Times</Label>
                                                <Input
                                                    id="times"
                                                    type="number"
                                                    min="0"
                                                    value={times || ""}
                                                    onChange={(e) => handleTimesChange(e.target.value)}
                                                    placeholder="Enter number of times"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        {/* Meal Timing Card */}
                        <Card className={'flex flex-col'}>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <Utensils className="h-6 w-6 text-green-500"/>
                                        <span>Meal Timing</span>
                                    </div>
                                    <Switch
                                        checked={mealTiming !== null}
                                        onCheckedChange={(checked) => setMealTiming(checked ? MEAL.BEFORE : null)}
                                    />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-full">
                                {mealTiming !== null ? (
                                    <RadioGroup
                                        value={mealTiming || ""}
                                        onValueChange={(value) => setMealTiming(value as MEAL)}
                                        className="space-y-3 w-full animate-fade-in"
                                    >
                                        {[
                                            {value: MEAL.BEFORE, label: "Before Meal"},
                                            {value: MEAL.WITH, label: "With Meal"},
                                            {value: MEAL.AFTER, label: "After Meal"},
                                        ].map(({value, label}) => (
                                            <div
                                                key={value}
                                                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-100 transition"
                                            >
                                                <RadioGroupItem value={value} id={value}/>
                                                <Label htmlFor={value} className="cursor-pointer">{label}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                ) : (
                                    <p className="text-gray-500 text-sm animate-fade-in">Enable meal timing to choose an
                                        option</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>


                    <Textarea
                        placeholder="Additional Details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setOpen(false);
                            resetForm();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddIssue}
                        disabled={!selectedDrug || !selectedBrand || !strategy}
                    >
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default IssueFromInventory;