'use client';

import React, {useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Card} from "@/components/ui/card";
import {useDebouncedCallback} from "use-debounce";
import {getCachedStrategy, searchAvailableDrugs, searchBrandByDrug} from "@/app/lib/actions";
import DrugCombobox from "./DrugCombobox";
import BrandCombobox from "./BrandCombobox";
import MedicationStrategyTabs from "./MedicationStratergyTabs";
import {Button} from "@/components/ui/button";
import type {
    MealStrategy,
    StrategyJson,
    WhenNeededStrategy,
    PeriodicStrategy,
    OtherStrategy
} from "@/app/lib/definitions";
import {StrategyJsonSchema} from "@/app/lib/definitions";
import {IssueingStrategy} from "@prisma/client";
import type {IssueInForm} from "@/app/(dashboard)/patients/[id]/prescribe/_components/PrescriptionForm";
import {calculateQuantity} from "@/app/lib/utils";
import {Plus} from "lucide-react";
import {Textarea} from "@/components/ui/textarea";

interface IssuesListProps {
    onAddIssue: (issue: IssueInForm) => void;
}

export type drug = {
    id: number;
    name: string;
    brandCount: number;
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
    const [drugs, setDrugs] = useState<drug[]>([]);
    const [selectedDrug, setSelectedDrug] = useState<number | null>(null);
    const [selectedDrugName, setSelectedDrugName] = useState<string | null>(null);
    const [brands, setBrands] = useState<BrandOption[]>([]);
    const [details, setDetails] = useState<string>("");
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [selectedBrandName, setSelectedBrandName] = useState<string | null>(null);
    const [strategy, setStrategy] = useState<IssueingStrategy | null>(null);
    const [error, setError] = useState<string | null>(null);

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
        dose: 0,
        times: 0
    });

    const [periodicStrategy, setPeriodicStrategy] = useState<PeriodicStrategy>({
        interval: 0,
        dose: 0,
        forDays: 0
    });

    const [otherStrategy, setOtherStrategy] = useState<OtherStrategy>({
        details: "",
        dose: 0,
        times: 0
    });

    const resetStrategies = () => {
        setMealStrategy({
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
        setWhenNeededStrategy({
            dose: 0,
            times: 0
        });
        setPeriodicStrategy({
            interval: 0,
            dose: 0,
            forDays: 0
        });
        setOtherStrategy({
            details: "",
            dose: 0,
            times: 0
        });
        setStrategy(null);
    }


    const resetForm = () => {
        setSelectedDrug(null);
        setSelectedDrugName(null);
        setSelectedBrand(null);
        setSelectedBrandName(null);
        setError(null);
        setStrategy(null);
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
                if (cachedBrand && cachedBrand.brandId === availableBrandIDs[0]) {
                    console.log(cachedBrand);
                    setSelectedBrand(cachedBrand.brandId);
                    setSelectedBrandName(cachedBrand.brand.name);
                    setStrategy(cachedBrand.issue.strategy);
                    const parsedData = StrategyJsonSchema.parse(cachedBrand.issue.strategyDetails);
                    switch (cachedBrand.issue.strategy) {
                        case IssueingStrategy.MEAL:
                            setMealStrategy(parsedData.strategy as MealStrategy);
                            setStrategy(IssueingStrategy.MEAL);
                            break;
                        case IssueingStrategy.WHEN_NEEDED:
                            setWhenNeededStrategy(parsedData.strategy as WhenNeededStrategy);
                            setStrategy(IssueingStrategy.WHEN_NEEDED);
                            break;
                        case IssueingStrategy.PERIODIC:
                            setPeriodicStrategy(parsedData.strategy as PeriodicStrategy);
                            setStrategy(IssueingStrategy.PERIODIC);
                            break;
                        case IssueingStrategy.OTHER:
                            setOtherStrategy(parsedData.strategy as OtherStrategy);
                            setStrategy(IssueingStrategy.OTHER);
                            break;
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
        setSelectedBrandName(brands.find(brand => brand.id === selectedID)?.name || null);
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

        let newStrategy: StrategyJson;

        switch (strategy) {
            case IssueingStrategy.MEAL:
                newStrategy = {
                    name: IssueingStrategy.MEAL,
                    strategy: mealStrategy
                }
                break;
            case IssueingStrategy.WHEN_NEEDED:
                newStrategy = {
                    name: IssueingStrategy.WHEN_NEEDED,
                    strategy: whenNeededStrategy
                }
                break;
            case IssueingStrategy.PERIODIC:
                newStrategy = {
                    name: IssueingStrategy.PERIODIC,
                    strategy: periodicStrategy
                }
                break;
            case IssueingStrategy.OTHER:
                newStrategy = {
                    name: IssueingStrategy.OTHER,
                    strategy: otherStrategy
                }
                break;
            default:
                throw new Error("Invalid strategy");
        }

        const parsedData = StrategyJsonSchema.parse(newStrategy);
        const quantity = calculateQuantity(parsedData);
        const newIssue: IssueInForm = {
            drugId: selectedDrug,
            drugName: selectedDrugName,
            details: details,
            brandId: selectedBrand,
            brandName: selectedBrandName,
            strategy: strategy,
            strategyDetails: parsedData,
            quantity: quantity
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

                    {/*Text Area*/}
                    <div className="flex items-start justify-start">
                        <Textarea
                            placeholder="Additional Details"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                    </div>

                    {/*Clear Button and error*/}
                    <div className={'flex justify-between'}>
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