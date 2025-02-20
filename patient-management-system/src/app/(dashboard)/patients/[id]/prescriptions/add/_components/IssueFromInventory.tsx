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
import {calculateQuantity} from "@/app/lib/utils";
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

export type TypeOption = {
    type: DrugType
}

export interface WeightOption {
    id: string | number;
    weight: string;
    brandCount: number;
    totalRemainingQuantity: number;
    farthestExpiry: Date;
}

export interface BrandOption {
    id: string | number;
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
    const [selectedDrug, setSelectedDrug] = useState<number | null>(null);
    const [selectedDrugName, setSelectedDrugName] = useState<string | null>(null);

    const [types, setTypes] = useState<TypeOption[]>([]);
    const [selectedType, setSelectedType] = useState<DrugType>("Tablet");

    const [weights, setWeights] = useState<WeightOption[]>([]);
    const [selectedWeight, setSelectedWeight] = useState<number | null>(null);

    const [brands, setBrands] = useState<BrandOption[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [selectedBrandName, setSelectedBrandName] = useState<string | null>(null);

    const [details, setDetails] = useState<string>("");
    const [strategy, setStrategy] = useState<IssuingStrategy | null>(null);


    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const [dose, setDose] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number | null>(null);
    const [times, setTimes] = useState<number | null>(null);
    const [forDays, setForDays] = useState<number | null>(null);
    const [mealTiming, setMealTiming] = useState<MEAL | null>(null);
    const [skipMeal, setSkipMeal] = useState(true);


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

    const handleQuantityChange = (value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setQuantity(numValue);
        }
    };

    const resetForm = () => {
        setSelectedDrug(null);
        setSelectedDrugName(null);
        setSelectedWeight(null);
        setSelectedBrand(null);
        setSelectedBrandName(null);
        setDetails("");
        setSkipMeal(true);
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
            console.log(drugs);
        } catch (error) {
            setError("Error searching drugs");
            console.error(error);
        } finally {
            setIsDrugSearching(false);
        }
    }, 700);

    const handleDrugSelect = async (selectedID: number) => {
        if (selectedID === selectedDrug) return;

        try {
            // Reset states before fetching new data
            setSelectedDrug(selectedID);
            setSelectedDrugName(drugs.find(drug => drug.id === selectedID)?.name || null);
            setIsBrandSearching(true);
            setIsWeightSearching(true);

            // Clear previous selections
            setSelectedWeight(null);
            setSelectedBrand(null);
            setSelectedBrandName(null);
            setStrategy(null);
            setDose(null);
            setForDays(null);
            setMealTiming(null);
            setDetails("");
            setTimes(null);

            // Fetch initial data
            const [cachedStrategy, types] = await Promise.all([
                getCachedStrategy(selectedID),
                getDrugTypesByDrug(selectedID)
            ]);

            if (!types.length) {
                throw new Error("No drug types available");
            }

            setTypes(types);

            // Handle drug type selection
            const hasValidCachedType = cachedStrategy && types.map(type => type.type).includes(cachedStrategy.lastDrugType);
            const selectedDrugType = hasValidCachedType ? cachedStrategy.lastDrugType : 'Tablet';
            setSelectedType(selectedDrugType);

            if (selectedDrugType === 'Tablet') {
                const weights = await getWeightByBrand({
                    drugID: selectedID,
                    type: selectedDrugType
                });
                setWeights(weights);

                // Handle weight selection for tablets
                const cachedWeight = cachedStrategy?.weight?.id;
                const availableWeightIDs = weights.map(weight => weight.id);
                const isValidCachedWeight = cachedWeight && availableWeightIDs.includes(cachedWeight);

                if (isValidCachedWeight && cachedStrategy) {
                    setSelectedWeight(cachedWeight);
                    const selectedWeight = weights.find(weight => weight.id === cachedWeight);
                    if (selectedWeight) {
                        showWarnings(selectedWeight);
                    }

                    // Fetch brands for selected weight
                    const drugBrands = await getBrandByDrugWeightType({
                        drugID: selectedID,
                        weightID: cachedWeight,
                        type: selectedDrugType
                    });
                    setBrands(drugBrands);

                    await handleCachedBrandStrategy(drugBrands, cachedStrategy);
                } else {
                    // If no valid cached weight, just set the weights and wait for user selection
                    setWeights(weights);
                    setBrands([]);
                }
            } else {
                // Handle non-tablet drug types
                const drugBrands = await getBrandByDrugWeightType({
                    drugID: selectedID,
                    type: selectedDrugType,
                    weightID: 0
                });
                setBrands(drugBrands);

                if (cachedStrategy) {
                    await handleCachedBrandStrategy(drugBrands, cachedStrategy);
                }
            }
        } catch (error) {
            console.error('Error in handleDrugSelect:', error);
            setError(error instanceof Error ? error.message : "Error fetching drug data");

            // Reset states on error
            setBrands([]);
            setWeights([]);
            setSelectedWeight(null);
            setSelectedBrand(null);
            setSelectedBrandName(null);
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
            setSelectedBrand(brand.id);
            setSelectedBrandName(brand.name);

            // Set issue details
            setStrategy(issue.strategy);
            setDose(issue.dose);
            setForDays(issue.forDays);
            setMealTiming(issue.meal);
            setDetails(issue.strategy);

            // Handle OTHER strategy specific logic
            if (issue.strategy === IssuingStrategy.OTHER) {
                const {quantity, dose} = issue;
                setTimes(dose > 0 && quantity != null ? quantity / dose : null);
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

    const handleTypeSelect = async (type: TypeOption) => {
        if (!selectedDrug) return;
        try {
            setSelectedType(type.type);
            setIsBrandSearching(true);
            setIsWeightSearching(true);

            // Reset previous selections
            setSelectedWeight(null);
            setSelectedBrand(null);
            setSelectedBrandName(null);
            setBrands([]);
            setWeights([]);

            if (type.type === 'Tablet') {
                // For tablets, first fetch weights
                const weights = await getWeightByBrand({
                    drugID: selectedDrug,
                    type: type.type
                });
                setWeights(weights);
                setIsWeightSearching(false);
                // Brands will be fetched after weight selection
            } else {
                // For non-tablets, directly fetch brands
                const drugBrands = await getBrandByDrugWeightType({
                    drugID: selectedDrug,
                    type: type.type,
                    weightID: 0
                });
                setBrands(drugBrands);
            }
        } catch (error) {
            console.error('Error in handleTypeSelect:', error);
            setError(error instanceof Error ? error.message : "Error fetching drug data");

            // Reset states on error
            setBrands([]);
            setWeights([]);
            setSelectedWeight(null);
            setSelectedBrand(null);
            setSelectedBrandName(null);
        } finally {
            setIsBrandSearching(false);
            setIsWeightSearching(false);
        }
    };

    const handleWeightSelect = async (selectedID: number) => {
        if (selectedType !== 'Tablet') return;
        setSelectedWeight(selectedID);
        const selectedWeight = weights.find(weight => weight.id === selectedID);
        if (selectedWeight) {
            showWarnings(selectedWeight);
            try {
                const drugBrands = await getBrandByDrugWeightType({
                    drugID: selectedDrug!,
                    weightID: selectedID,
                    type: selectedType,
                });
                setBrands(drugBrands);
            } catch (error) {
                console.error(error);
                setError("Error fetching brands");
            }
        }
    };

    const handleBrandSelect = (selectedID: number) => {
        setSelectedBrand(selectedID);
        const selectedBrand = brands.find(brand => brand.id === selectedID);
        setSelectedBrandName(selectedBrand?.name || null);
        if (selectedBrand) {
            showWarnings(selectedBrand);
        }
    };

    const handleAddIssue = () => {
        if (!selectedDrug || !selectedBrand || !strategy || !selectedDrugName || !selectedBrandName || !selectedWeight) {
            const missingFields = [
                !selectedDrug && "Drug",
                !selectedWeight && "Weight",
                !selectedBrand && "Brand",
                !strategy && "Strategy"
            ].filter(Boolean);

            setError(`Please fill all required fields: ${missingFields.join(", ")}`);
            return;
        }

        const calculatedQuantity = calculateQuantity({
            dose: dose || 0,
            strategy,
            forDays: forDays || 0,
            times: times || 0
        });

        const newIssue: IssueInForm = {
            drugId: selectedDrug,
            drugName: selectedDrugName,
            details,
            brandId: selectedBrand,
            brandName: selectedBrandName,
            strategy,
            dose: dose || 0,
            forDays: forDays || 0,
            quantity: calculatedQuantity,
            meal: mealTiming,
            forTimes: times || 0,
        };

        onAddIssue(newIssue);
        setOpen(false);
        resetForm();
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
                            onChange={(id) => handleDrugSelect(Number(id))}
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
                                onChange={(id) => handleWeightSelect(Number(id))}
                                isSearching={isWeightSearching}
                                value={selectedWeight}
                                placeholder="Select weight"
                                noOptionsMessage="No weights found"
                                searchPlaceholder="Search weights"
                                disabled={!selectedDrug || selectedType !== 'Tablet'}
                            />
                        </div>
                        <BrandCombobox
                            options={brands}
                            onChange={(id) => handleBrandSelect(Number(id))}
                            onSearch={() => {
                            }}
                            isSearching={isBrandSearching}
                            value={selectedBrand}
                            placeholder="Select brand"
                            searchPlaceholder="Search brand"
                            noOptionsMessage="No brands found"
                            disabled={!selectedType || (selectedType === DrugType.Tablet && !selectedWeight)}
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <ClipboardCheck className="h-6 w-6 text-blue-500"/>
                                <span>Dosage & Duration</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {strategy && strategy !== IssuingStrategy.SOS && strategy !== IssuingStrategy.OTHER ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="dose">Dosage</Label>
                                        <Input
                                            id="dose"
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={dose || ""}
                                            onChange={(e) => {
                                                handleDoseChange(e.target.value);
                                            }}
                                            placeholder="Enter dosage"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="forDays">For Days</Label>
                                        <Input
                                            id="forDays"
                                            type="number"
                                            min="0"
                                            value={forDays || ""}
                                            onChange={(e) => {
                                                handleForDaysChange(e.target.value);
                                            }}
                                            placeholder="Enter number of days"
                                        />
                                    </div>
                                </div>
                            ) : (
                                strategy && (
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min="0"
                                            value={quantity || ""}
                                            onChange={(e) => {
                                                handleQuantityChange(e.target.value);
                                            }}
                                            placeholder="Enter quantity"
                                        />
                                    </div>
                                )
                            )}
                        </CardContent>
                    </Card>

                    {/* Meal Timing Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Utensils className="h-6 w-6 text-green-500"/>
                                <span>Meal Timing</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>No Meal Preference</Label>
                                <Switch checked={skipMeal} onCheckedChange={(checked) => {
                                    setSkipMeal(checked);
                                    if (checked) setMealTiming(null);
                                }}/>
                            </div>
                            {!skipMeal && (
                                <RadioGroup
                                    value={mealTiming || ""}
                                    onValueChange={(value) => setMealTiming(value as MEAL)}
                                    className="grid grid-cols-3 gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={MEAL.BEFORE} id="before"/>
                                        <Label htmlFor="before">Before Meal</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={MEAL.WITH} id="with"/>
                                        <Label htmlFor="with">With Meal</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={MEAL.AFTER} id="after"/>
                                        <Label htmlFor="after">After Meal</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        </CardContent>
                    </Card>

                    <Textarea
                        placeholder="Additional Details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="resize-none"
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