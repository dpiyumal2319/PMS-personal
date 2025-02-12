'use client'

import React, {useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Toggle} from "@/components/ui/toggle";
import {useDebouncedCallback} from "use-debounce";
import {searchAvailableDrugs, searchBrandByDrug} from "@/app/lib/actions";
import DrugCombobox from "@/app/(dashboard)/patients/[id]/_components/DrugCombobox";
import BrandCombobox from "@/app/(dashboard)/patients/[id]/_components/BrandCombobox";

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


const IssuesList = () => {
        const [isDrugSearching, setIsDrugSearching] = useState(false);
        const [isBrandSearching, setIsBrandSearching] = useState(false);
        const [drugs, setDrugs] = useState<drug[]>([]);
        const [selectedDrug, setSelectedDrug] = useState<number | null>(null);
        const [brands, setBrands] = useState<BrandOption[]>([]);
        const [selectedBrand, setSelectedBrand] = useState<number | null>(null);

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
            setSelectedDrug(selectedID);
            if (selectedID !== selectedDrug) {
                setIsBrandSearching(true);
                try {
                    const brands = await searchBrandByDrug({drugID: selectedID});
                    setBrands(brands);
                } finally {
                    setIsBrandSearching(false);
                }
            }
        };


        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Card className="border-dashed border-2 p-4 flex justify-center items-center cursor-pointer">
                        + Add Drug
                    </Card>
                </DialogTrigger>
                <DialogContent className={'max-w-5xl'}>
                    <DialogHeader>
                        <DialogTitle>Add Issue</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <DrugCombobox options={drugs} onChange={(selectedID) => handleDrugSelect(Number(selectedID))}
                                          onSearch={handleDrugSearch} isSearching={isDrugSearching}
                                          placeholder={"Select drug"}
                                          searchPlaceholder={"Search drug"} noOptionsMessage={"No drugs found"}
                                          className={selectedDrug ? "border-primary-500 shadow-sm" : "border-gray-300 hover:border-gray-400"}/>
                            <BrandCombobox options={brands} onChange={(selectedID) => setSelectedBrand(Number(selectedID))}
                                           onSearch={() => {
                                           }} isSearching={isBrandSearching} noOptionsMessage={"No brands found"}
                                           placeholder={"Select brand"} searchPlaceholder={"Search brand"}
                                           className={selectedBrand ? "border-primary-500 shadow-sm" : "border-gray-300 hover:border-gray-400"} disabled={!selectedDrug}/>
                        </div>
                        <Tabs defaultValue="MEAL">
                            <TabsList>
                                <TabsTrigger value="MEAL"> Meal</TabsTrigger>
                                <TabsTrigger value="WHEN_NEEDED">When Needed</TabsTrigger>
                                <TabsTrigger value="PERIODIC">Periodic</TabsTrigger>
                                <TabsTrigger value="OFF_RECORD">Off Record</TabsTrigger>
                                <TabsTrigger value="OTHER">Other</TabsTrigger>
                            </TabsList>
                            <TabsContent value="MEAL">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox defaultChecked/> <Label>Breakfast</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox defaultChecked/> <Label>Lunch</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox defaultChecked/> <Label>Dinner</Label>
                                    </div>
                                    <Input type="number" placeholder="Quantity per meal"/>
                                    <Toggle>Before / After Meal</Toggle>
                                    <Input type="number" placeholder="Minutes before/after meal"/>
                                </div>
                            </TabsContent>
                            <TabsContent value="WHEN_NEEDED">
                                <Input type="text" placeholder="When needed details"/>
                            </TabsContent>
                            <TabsContent value="PERIODIC">
                                <Input type="text" placeholder="Periodic details"/>
                            </TabsContent>
                            <TabsContent value="OFF_RECORD">
                                <Input type="text" placeholder="Off record details"/>
                            </TabsContent>
                            <TabsContent value="OTHER">
                                <Input type="text" placeholder="Other details"/>
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        )
            ;
    }
;

export default IssuesList;