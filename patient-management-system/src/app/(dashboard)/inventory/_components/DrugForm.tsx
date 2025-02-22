"use client";
import React, {useCallback, useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    addNewItem,
    searchDrugBrands,
    searchDrugModels,
    getDrugConcentrations,
} from "@/app/lib/actions";
import {Plus, X} from "lucide-react";
import {handleServerAction} from "@/app/lib/utils";
import {
    DrugBrandSuggestion,
    DrugModelSuggestion,
    InventoryFormData,
    DrugConcentrationDataSuggestion
} from "@/app/lib/definitions";
import {DrugSuggestionBox} from "@/app/(dashboard)/inventory/_components/DrugSuggestionBox";
import {DrugConcentrationField} from "@/app/(dashboard)/inventory/_components/AddWeightField";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import CustomDrugTypeSelect from "@/app/(dashboard)/inventory/available-stocks/_components/CustomDrugTypeSelect";

export function DrugForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<InventoryFormData>({
        brandName: "",
        drugName: "",
        batchNumber: "",
        drugType: "Tablet",
        quantity: "",
        expiry: "",
        retailPrice: "",
        wholesalePrice: "",
        concentration: 0,
    });

    const [brandSuggestions, setBrandSuggestions] = useState<
        DrugBrandSuggestion[]
    >([]);
    const [drugSuggestions, setDrugSuggestions] = useState<DrugModelSuggestion[]>(
        []
    );
    const [drugConcentrations, setDrugConcentrations] = useState<DrugConcentrationDataSuggestion[]>(
        []
    );
    const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
    const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);

    const handleConcentrationAdded = (newWeight: DrugConcentrationDataSuggestion) => {
        // Update the weights list and select the new weight
        setDrugConcentrations((prev) => {
            const exists = prev.some((w) => w.id === newWeight.id);
            if (!exists) {
                return [...prev, newWeight];
            }
            return prev;
        });

        // Update the form data with the new weight
        setFormData((prev) => ({
            ...prev,
            weightId: newWeight.id,
            weight: newWeight.concentration,
        }));
    };
    const handleConcentrationDeleted = (deleteWeight: DrugConcentrationDataSuggestion) => {
        // Delete the weight from the list
        setDrugConcentrations((prev) => {
            return prev.filter((w) => w.id !== deleteWeight.id);
        });

        // Update the form data if the deleted weight was selected
        if (formData.concentrationId === deleteWeight.id) {
            setFormData((prev) => ({
                ...prev,
                weightId: undefined,
                weight: 0,
            }));
        }
    }


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        const updatedValue = e.target.type === "number" ? Number(value) : value;
        setFormData((prev) => {
            if (name === "weightId") {
                // Find the selected weight object from the drugWeights array
                const selectedWeight = drugConcentrations.find(
                    (weight) => weight.id === Number(value)
                );

                return {
                    ...prev,
                    weightId: Number(value),
                    weight: selectedWeight ? selectedWeight.concentration : 0, // Update the weight value
                };
            }

            return {...prev, [name]: updatedValue};
        });

        if (name === "brandName") {
            if (value.length >= 2) {
                handleBrandSearch(value).then();
                setShowBrandSuggestions(true);
            } else {
                setBrandSuggestions([]);
                setShowBrandSuggestions(false);
            }
        } else if (name === "drugName") {
            if (value.length >= 2) {
                handleDrugSearch(value).then();
                setShowDrugSuggestions(true);
            } else {
                setDrugSuggestions([]);
                setShowDrugSuggestions(false);
            }
        }
    };

    const fetchDrugWeights = useCallback(async () => {
        if (!formData.drugId) return;

        try {
            console.log("Fetching drug weights");
            const weights = await getDrugConcentrations(formData.drugId);
            const uniqueWeights = Array.from(
                new Map(weights.map((weight) => [weight.id, weight])).values()
            );
            setDrugConcentrations(uniqueWeights);
        } catch (error) {
            console.error("Error fetching drug weights:", error);
            setDrugConcentrations([]);
        }
    }, [formData.drugId]); // Dependencies ensure this function updates when drugId changes

    // Fetch when drugId changes
    useEffect(() => {
        fetchDrugWeights().then();
    }, [fetchDrugWeights]); // Calls fetch when the function reference changes

    const handleBrandSearch = async (query: string) => {
        try {
            const results = await searchDrugBrands(query);
            setBrandSuggestions(results);
        } catch (error) {
            console.error("Error searching brands:", error);
            setBrandSuggestions([]);
        }
    };

    const handleDrugSearch = async (query: string) => {
        try {
            const results = await searchDrugModels(query);
            setDrugSuggestions(results);
        } catch (error) {
            console.error("Error searching drugs:", error);
            setDrugSuggestions([]);
        }
    };

    const handleBrandSelect = (suggestion: DrugBrandSuggestion) => {
        setFormData((prev) => ({
            ...prev,
            brandId: suggestion.id,
            brandName: suggestion.name,
        }));
        setShowBrandSuggestions(false);
    };

    const handleDrugSelect = (suggestion: DrugModelSuggestion) => {
        setFormData((prev) => ({
            ...prev,
            drugId: suggestion.id,
            drugName: suggestion.name,
        }));
        setShowDrugSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        console.log("Payload being sent:", formData);
        e.preventDefault();

        try {
            const result = await handleServerAction(() => addNewItem({formData}), {
                loadingMessage: "Adding new item...",
            });

            if (result.success) {
                setIsOpen(false);
                setFormData({
                    brandName: "",
                    drugName: "",
                    batchNumber: "",
                    drugType: "Tablet",
                    quantity: "",
                    expiry: "",
                    wholesalePrice: "",
                    retailPrice: "",
                    concentration: 0,
                });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                    <Plus className="w-4 h-4 mr-2"/> Add New Item
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-primary-600 text-center">Add New Drug</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="brandName" className="block text-sm font-medium mb-1">Brand Name</label>
                        <Input id="brandName" value={formData.brandName} onChange={handleChange} required
                               name="brandName" className={'h-8'}/>
                        <DrugSuggestionBox suggestions={brandSuggestions} visible={showBrandSuggestions}
                                           onSelect={handleBrandSelect}/>
                    </div>
                    <div>
                        <label htmlFor="drugName" className="block text-sm font-medium mb-1">Drug Name</label>
                        <Input id="drugName" value={formData.drugName} onChange={handleChange} required
                               name="drugName" className={'h-8'}/>
                        <DrugSuggestionBox suggestions={drugSuggestions} visible={showDrugSuggestions}
                                           onSelect={handleDrugSelect}/>
                    </div>
                    <div>
                        <label htmlFor="drugType" className="block text-sm font-medium mb-1">Drug Type</label>
                        <CustomDrugTypeSelect
                            value={formData.drugType}
                            onValueChange={(value) => setFormData({...formData, drugType: value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="batchNumber" className="block text-sm font-medium mb-1">Batch Number</label>
                            <Input id="batchNumber" value={formData.batchNumber} onChange={handleChange} required
                                   name="batchNumber" className={'h-8'}/>
                        </div>
                        <DrugConcentrationField concentrations={drugConcentrations} drugId={formData.drugId}
                                                onChange={handleChange}
                                                onConcentrationDeleted={handleConcentrationDeleted}
                                                onConcentrationAdded={handleConcentrationAdded}
                                                selectedConcentrationId={formData.concentrationId}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
                            <Input id="quantity" type="number" value={formData.quantity} onChange={handleChange}
                                   required name="quantity" min="0" className={'h-8'}/>
                        </div>
                        <div>
                            <label htmlFor="wholesalePrice" className="block text-sm font-medium mb-1">Wholesale
                                Price</label>
                            <Input id="wholesalePrice" type="number" step="0.01" value={formData.wholesalePrice}
                                   onChange={handleChange} required name="wholesalePrice" min="0" className={'h-8'}/>
                        </div>
                        <div>
                            <label htmlFor="retailPrice" className="block text-sm font-medium mb-1">Retail Price</label>
                            <Input id="retailPrice" type="number" step="0.01" value={formData.retailPrice}
                                   onChange={handleChange} required name="retailPrice" min="0" className={'h-8'}/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="expiry" className="block text-sm font-medium mb-1">Expiry Date</label>
                        <Input id="expiry" type="date" value={formData.expiry} onChange={handleChange} required
                               name="expiry" className={'h-8'}/>
                    </div>
                    <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600">Add Item</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
