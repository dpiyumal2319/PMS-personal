'use client';

import React, {useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useDebouncedCallback} from "use-debounce";
import {
    getCachedStrategy,
    searchAvailableDrugs,
    getConcentrationByDrug,
    getBrandByDrugConcentrationType, getDrugTypesByDrug
} from "@/app/lib/actions/prescriptions";
import DrugCombobox from "./DrugCombobox";
import BrandCombobox from "./BrandCombobox";
import MedicationStrategyTabs from "./MedicationStratergyTabs";
import {Button} from "@/components/ui/button";
import {IssuingStrategy, MEAL} from "@prisma/client";
import type {DrugType} from "@prisma/client";
import type {IssueInForm} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";
import {calculateForDays, calculateQuantity, calculateTimes} from "@/app/lib/utils";
import {CircleAlert, ClipboardCheck, Plus, TriangleAlert, Utensils} from "lucide-react";
import {Textarea} from "@/components/ui/textarea";
import {differenceInDays} from "date-fns";
import ConcentrationComboBox from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/ConcentrationComboBox";
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
    concentrationCount: number;
}

export type CustomDrugType = {
    name: string,
    type: DrugType
}

export interface ConcentrationOption {
    id: number;
    concentration: string;
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
    const [isConcentrationSearching, setIsConcentrationSearching] = useState(false);
    const [isTypeSearching, setIsTypeSearching] = useState(false);

    const [drugs, setDrugs] = useState<DrugOption[]>([]);
    const [selectedDrug, setSelectedDrug] = useState<DrugOption | null>(null);

    const [types, setTypes] = useState<CustomDrugType[]>([]);
    const [selectedType, setSelectedType] = useState<CustomDrugType | null>(null);

    const [concentrations, setConcentrations] = useState<ConcentrationOption[]>([]);
    const [selectedConcentration, setSelectedConcentration] = useState<ConcentrationOption | null>(null);

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

    const resetStrategy = () => {
        setStrategy(null);
        setDose(null);
        setForDays(null);
        setMealTiming(null);
        setDetails("");
        setTimes(null);
    }

    const resetForm = () => {
        setSelectedDrug(null);
        setSelectedConcentration(null);
        setSelectedBrand(null);
        setSelectedType(null);
    };

    const showWarnings = (item: ConcentrationOption | BrandOption) => {
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
        if (selected === selectedDrug || !selected) return;
        setError(null);
        setWarning(null);
        try {
            // Reset states before fetching new data
            setSelectedDrug(selected);
            setIsBrandSearching(true);
            setIsConcentrationSearching(true);
            setIsTypeSearching(true);

            // Clear previous selections
            setSelectedConcentration(null);
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

            if (!types.length) {
                throw new Error("No drug types available");
            }

            setTypes(types);

            if (!cachedStrategy || !cachedStrategy.issue.batch || !types.some(type => type.name === cachedStrategy.issue.batch?.type)) {
                console.warn("No cached strategy or cached strategy is invalid");
                setConcentrations([]);
                setBrands([]);
                setSelectedType(null);
                setSelectedConcentration(null);
                setSelectedBrand(null);
                return; // **Early exit**
            }


            const selectedDrugType = types.find(type => type.name === cachedStrategy.issue.batch?.type) || null;
            setSelectedType(selectedDrugType);
            if (!selectedDrugType) return;


            const concentrations = await getConcentrationByDrug({
                drugID: selected.id,
                type: selectedDrugType.type,
            });

            setConcentrations(concentrations);
            const cacheConcentrationID = cachedStrategy?.issue.batch?.unitConcentrationId;
            const isValidCachedConcentration = cacheConcentrationID && concentrations.some(concentration => concentration.id === cacheConcentrationID);


            if (!isValidCachedConcentration) {
                console.warn("Cached concentration is invalid");
                setBrands([]);
                setSelectedConcentration(null);
                setSelectedBrand(null);
                return; // **Early exit**
            }


            const cachedConcentration: ConcentrationOption = concentrations.find(concentration => concentration.id === cacheConcentrationID)!;
            setSelectedConcentration(cachedConcentration);
            showWarnings(cachedConcentration);

            // Fetch brands
            const drugBrands = await getBrandByDrugConcentrationType({
                drugID: selected.id,
                concentrationID: cacheConcentrationID,
                type: selectedDrugType.type,
            });

            setBrands(drugBrands);
            await handleCachedBrandStrategy(drugBrands, cachedStrategy);
        } catch (error) {
            console.error("Error in handleDrugSelect:", error);
            setError(error instanceof Error ? error.message : "Error fetching drug data");

            // Reset states on error
            setBrands([]);
            setConcentrations([]);
            setSelectedConcentration(null);
            setSelectedBrand(null);
        } finally {
            setIsBrandSearching(false);
            setIsConcentrationSearching(false);
            setIsTypeSearching(false);
        }
    };

    // Helper function to handle cached brand strategy
    const handleCachedBrandStrategy = async (
        drugBrands: BrandOption[],
        cachedStrategy: CachedStrategy
    ) => {
        if (!cachedStrategy) return;

        const availableBrandIDs = drugBrands.map(brand => brand.id);
        if (!availableBrandIDs.includes(cachedStrategy.issue.brandId)) {
            // Reset strategy-related states if cached brand is not available
            console.warn("Cached brand is not available");
            setStrategy(null);
            setDose(null);
            setForDays(null);
            setMealTiming(null);
            setDetails("");
            setTimes(null);
            setSelectedBrand(null);
            return;
        }

        const {issue} = cachedStrategy;
        const selectedBrand_local = drugBrands.find(b => b.id === issue.brandId) || null;

        // Set brand information
        setSelectedBrand(selectedBrand_local);
        // Set issue details
        setStrategy(issue.strategy);
        setDose(issue.dose);
        setMealTiming(issue.meal);
        setDetails(issue.strategy);

        // Handle OTHER strategy specific logic
        if (issue.strategy === IssuingStrategy.OTHER || issue.strategy === IssuingStrategy.SOS) {
            const {quantity, dose} = issue;
            setTimes(calculateTimes({strategy: issue.strategy, dose: dose, quantity: quantity}));
        } else {
            setForDays(calculateForDays({strategy: issue.strategy, dose: issue.dose, quantity: issue.quantity}));
        }

        // Show warnings if applicable
        if (selectedBrand_local) {
            showWarnings(selectedBrand_local);
        }
    };

    const handleTypeSelect = async (type: CustomDrugType) => {
        if (selectedType === type || !selectedDrug || !type) return;
        setError(null);
        setWarning(null);
        try {
            setSelectedType(type);
            setIsBrandSearching(true);
            setIsConcentrationSearching(true);

            // Reset previous selections
            setSelectedConcentration(null);
            setSelectedBrand(null);
            setBrands([]);
            setConcentrations([]);

            // For tablets, first fetch concentrations
            const concentrations = await getConcentrationByDrug({
                drugID: selectedDrug.id,
                type: type.type,
            });

            setConcentrations(concentrations);
            setIsConcentrationSearching(false);
        } catch (error) {
            console.error('Error in handleTypeSelect:', error);
            setError(error instanceof Error ? error.message : "Error fetching drug data");

            // Reset states on error
            setBrands([]);
            setConcentrations([]);
            setSelectedConcentration(null);
            setSelectedBrand(null);
        } finally {
            setIsBrandSearching(false);
            setIsConcentrationSearching(false);
        }
    };

    const handleConcentrationSelect = async (selected: ConcentrationOption) => {
        if (selectedConcentration === selected) return;
        setError(null);
        setWarning(null);
        setSelectedConcentration(selected);
        if (!selectedDrug || !selectedType || !selected) return;
        showWarnings(selected);
        try {
            setIsBrandSearching(true);
            const drugBrands = await getBrandByDrugConcentrationType({
                drugID: selectedDrug.id,
                concentrationID: selected.id,
                type: selectedType.type,
            });
            setBrands(drugBrands);
        } catch (error) {
            console.error(error);
            setError("Error fetching brands");
        } finally {
            setIsBrandSearching(false);
        }

    };

    const handleBrandSelect = (selected: BrandOption) => {
        if (selectedBrand === selected) return;
        setError(null);
        setWarning(null);
        setSelectedBrand(selected);
        if (!selected || !selectedConcentration || !selectedDrug || !selectedType) return;
        showWarnings(selected);
    };

    const handleAddIssue = () => {
        // if (!selectedDrug || !selectedBrand || !strategy || !selectedDrugName || !selectedBrandName || !selectedConcentration) {
        //     const missingFields = [
        //         !selectedDrug && "Drug",
        //         !selectedConcentration && "Concentration",
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
                <div className="flex flex-col space-y-2">
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
                            <ConcentrationComboBox
                                options={concentrations}
                                onChange={(concentration) => handleConcentrationSelect(concentration)}
                                isSearching={isConcentrationSearching}
                                value={selectedConcentration}
                                placeholder="Select concentration"
                                noOptionsMessage="No concentrations found"
                                searchPlaceholder="Search concentrations"
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

                    <div className={'flex flex-col gap-2 animate-fade-in'}>
                        {warning && (
                            <span
                                className="text-yellow-500 text-sm flex items-center"
                                aria-live="polite"
                                role="status"
                            >
                                <TriangleAlert className="mr-1" aria-hidden="true" size={18}/>
                                {warning}
                            </span>
                        )}
                        {error && (
                            <span
                                className="text-red-500 text-sm flex items-center mt-2"
                                role="alert"
                            >
                                <CircleAlert className="mr-1" aria-hidden="true" size={18}/>
                                {error}
                            </span>
                        )}
                    </div>


                    <MedicationStrategyTabs
                        selectedStrategy={{
                            selectedStrategy: strategy,
                            setSelectedStrategy: setStrategy
                        }}
                    />

                    <div className="flex justify-end">
                        <button
                            onClick={resetStrategy}
                            className="text-red-400 cursor-pointer text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                            aria-label="Clear strategy"
                        >
                            Clear Strategy
                        </button>
                    </div>

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
                                <div className="flex flex-col gap-4 animate-fade-in" key={strategy}>
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
                                        className="space-y-2"
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