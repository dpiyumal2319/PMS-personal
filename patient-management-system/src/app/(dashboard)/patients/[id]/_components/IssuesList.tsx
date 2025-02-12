'use client';

import React, {useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Card} from "@/components/ui/card";
import {useDebouncedCallback} from "use-debounce";
import {searchAvailableDrugs, searchBrandByDrug} from "@/app/lib/actions";
import DrugCombobox from "./DrugCombobox";
import BrandCombobox from "./BrandCombobox";
import MedicationStrategyTabs from "./MedicationStratergyTabs";
import {Button} from "@/components/ui/button";
import type {StrategyJson} from "@/app/lib/definitions";
import {StrategyJsonSchema} from "@/app/lib/definitions";
import {Issue, IssueingStrategy} from "@prisma/client";

interface IssuesListProps {
    onAddIssue: (issue: Issue) => void;
    existingIssues: Issue[];
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

const IssuesList: React.FC<IssuesListProps> = ({onAddIssue, existingIssues}) => {
    const [open, setOpen] = useState(false);
    const [isDrugSearching, setIsDrugSearching] = useState(false);
    const [isBrandSearching, setIsBrandSearching] = useState(false);
    const [drugs, setDrugs] = useState<drug[]>([]);
    const [selectedDrug, setSelectedDrug] = useState<number | null>(null);
    const [brands, setBrands] = useState<BrandOption[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [strategy, setStrategy] = useState<IssueingStrategy | null>(null);
    const [strategyData, setStrategyData] = useState<StrategyJson | null>(null);


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
            setIsBrandSearching(true);
            try {
                const brands = await searchBrandByDrug({drugID: selectedID});
                setBrands(brands);
            } finally {
                setIsBrandSearching(false);
            }
        }
    };

    const handleStrategyChange = (newStrategy: IssueingStrategy, newStrategyData: StrategyJson) => {
        setStrategy(newStrategy);
        setStrategyData(newStrategyData);
    };

    const handleAddIssue = () => {
        if (!selectedDrug || !selectedBrand || !strategy || !strategyData) {
            return;
        }

        const parsedData = StrategyJsonSchema.parse(strategyData);

        const newIssue: Issue = {
            id: Date.now(), // temporary ID for client-side
            prescriptionId: 1, // temporary prescription ID
            batchId: null,
            drugId: selectedDrug,
            brandId: selectedBrand,
            strategy: strategy,
            strategyDetails: parsedData,
            quantity: 10,
        };

        onAddIssue(newIssue);
        setOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setSelectedDrug(null);
        setSelectedBrand(null);
        setStrategy(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Card className="border-dashed border-2 p-4 flex justify-center items-center cursor-pointer">
                    + Add Drug
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
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
                            onChange={(selectedID) => setSelectedBrand(Number(selectedID))}
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
                    <MedicationStrategyTabs
                        onStrategyChange={handleStrategyChange}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
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

export default IssuesList;