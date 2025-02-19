'use client';

import React, {useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Card} from "@/components/ui/card";
import {useDebouncedCallback} from "use-debounce";
import {getCachedStrategy, searchAvailableDrugs, searchBrandByDrug} from "@/app/lib/actions/prescriptions";
import DrugCombobox from "./DrugCombobox";
import BrandCombobox from "./BrandCombobox";
import MedicationStrategyTabs from "./MedicationStratergyTabs";
import {Button} from "@/components/ui/button";
import {IssuingStrategy, MEAL} from "@prisma/client";
import type {IssueInForm} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";
import {calculateQuantity} from "@/app/lib/utils";
import {Plus} from "lucide-react";
import {Textarea} from "@/components/ui/textarea";
import {differenceInDays} from "date-fns";

interface IssuesListProps {
    onAddIssue: (issue: IssueInForm) => void;
}

export type drugOptions = {
    id: number;
    name: string;
    weightCount: number;
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

const IssueFromInventory: React.FC<IssuesListProps> = ({onAddIssue}) => {
    const [open, setOpen] = useState(false);
    const [isDrugSearching, setIsDrugSearching] = useState(false);
    const [isBrandSearching, setIsBrandSearching] = useState(false);

    const [drugs, setDrugs] = useState<drugOptions[]>([]);
    const [selectedDrug, setSelectedDrug] = useState<number | null>(null);
    const [selectedDrugName, setSelectedDrugName] = useState<string | null>(null);

    const [weights, setWeights] = useState<WeightOption[]>([]);
    const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null);

    const [brands, setBrands] = useState<BrandOption[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [selectedBrandName, setSelectedBrandName] = useState<string | null>(null);

    const [details, setDetails] = useState<string | null>(null);
    const [strategy, setStrategy] = useState<IssuingStrategy | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const [dose, setDose] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number | null>(null);
    const [times, setTimes] = useState<number | null>(null);
    const [forDays, setForDays] = useState<number | null>(null);
    const [meal, setMeal] = useState<MEAL | null>(null);

    const resetStrategies = () => {
        setStrategy(null);
    }


    const resetForm = () => {
        setSelectedDrug(null);
        setSelectedDrugName(null);
        setSelectedBrand(null);
        setDetails("");
        setSelectedBrandName(null);
        setError(null);
        setStrategy(null);
    };

    const showWarnings = (brand: BrandOption) => {
        const expiry = brand.farthestExpiry;
        const remainingQuantity = brand.totalRemainingQuantity;
        const currentDate = new Date();
        const expiryDate = new Date(expiry);
        const daysUntilExpiry = differenceInDays(expiryDate, currentDate);

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
        } finally {
            setIsDrugSearching(false);
        }
    }, 700);

    const handleDrugSelect = async (selectedID: number) => {
        if (selectedID !== selectedDrug) {
            setSelectedDrug(selectedID);
            setSelectedDrugName(drugs.find(drug => drug.id === selectedID)?.name || null);
            setIsBrandSearching(true);
            try {
                const brands = await searchBrandByDrug({drugID: selectedID});
                setBrands(brands);
                const cachedBrand = await getCachedStrategy(selectedID);
                const availableBrandIDs = brands.map(brand => brand.id);
                if (cachedBrand && cachedBrand.brandId && availableBrandIDs.includes(cachedBrand.brandId)) {
                    setSelectedBrand(cachedBrand.brandId);
                    setSelectedBrandName(cachedBrand.brand.name);
                    setStrategy(cachedBrand.issue.strategy);
                    setDetails(cachedBrand.issue.details);
                    const selectedBrand = brands.find(brand => brand.id === cachedBrand.brandId);
                    if (selectedBrand) {
                        showWarnings(selectedBrand);
                    }
                } else {
                    resetStrategies();
                }
            } catch (e) {
                console.error(e);
                setError("Error fetching brands");
            } finally {
                setIsBrandSearching(false);
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

    const handleAddIssue = async () => {
        if (!selectedDrug || !selectedBrand || !strategy || !selectedDrugName || !selectedBrandName) {
            const missingFields = [];
            if (!selectedDrug) missingFields.push("Drug");
            if (!selectedBrand) missingFields.push("Brand");
            if (!strategy) missingFields.push("Strategy");
            setError(`Please fill all the fields, missing: ${missingFields.join(", ")}`);
            return;
        }

        const quantity = calculateQuantity({
            dose: dose || 0,
            strategy: strategy,
            forDays: forDays || 0,
            times: times || 0
        })
        const newIssue: IssueInForm = {
            drugId: selectedDrug,
            drugName: selectedDrugName,
            details: details,
            brandId: selectedBrand,
            brandName: selectedBrandName,
            strategy: strategy,
            dose: dose || 0,
            forDays: forDays || 0,
            meal: meal,
            forTimes: times || 0,
        };

        onAddIssue(newIssue);
        setOpen(false);
        resetForm();
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Card
                    className="border-dashed border-2 p-4 flex justify-center items-center cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 group"
                >
                    <div className="flex items-center space-x-2 text-slate-500 group-hover:text-slate-800">
                        <Plus className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"/>
                        <span className="font-medium">Issue from Inventory</span>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-3xl overflow-y-scroll max-h-screen">
                <DialogHeader>
                    <DialogTitle>Add Issue</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                        <DrugCombobox
                            options={drugs}
                            onChange={(selectedID) => handleDrugSelect(Number(selectedID))}
                            onSearch={handleDrugSearch}
                            isSearching={isDrugSearching}
                            value={selectedDrug}
                            placeholder="Select drug"
                            searchPlaceholder="Search drug"
                            noOptionsMessage="No drugs found"
                        />
                        <BrandCombobox
                            options={brands}
                            onChange={(selectedID) => handleBrandSelect(Number(selectedID))}
                            onSearch={() => {
                            }}
                            isSearching={isBrandSearching}
                            value={selectedBrand}
                            placeholder="Select brand"
                            searchPlaceholder="Search brand"
                            noOptionsMessage="No brands found"
                            disabled={!selectedDrug}
                        />
                    </div>

                    {/*Clear Button and error*/}
                    <div className={'flex justify-between'}>
                        <span className="text-red-500 text-sm">{warning}</span>
                        <span className="text-red-500 text-sm">{error}</span>
                        <span onClick={resetForm} className="text-red-500 cursor-pointer text-sm hover:underline">
                            X Clear
                        </span>
                    </div>

                    <MedicationStrategyTabs
                        mealStrategy={{mealStrategy, setMealStrategy}}
                        whenNeededStrategy={{whenNeededStrategy, setWhenNeededStrategy}}
                        periodicStrategy={{periodicStrategy, setPeriodicStrategy}}
                        otherStrategy={{otherStrategy, setOtherStrategy}}
                        selectedStrategy={{selectedStrategy: strategy, setSelectedStrategy: setStrategy}}
                    />


                    {/*Text Area*/}
                    <div className="flex items-start justify-start">
                        <Textarea
                            placeholder="Additional Details"
                            value={details || ""}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
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