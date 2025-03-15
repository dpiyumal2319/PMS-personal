"use client";
import React, {useCallback, useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    addNewItem,
    searchDrugBrands,
    searchDrugModels,
    getDrugConcentrations,
    searchSuppliers,
} from "@/app/lib/actions";
import {Plus} from "lucide-react";
import {handleServerAction} from "@/app/lib/utils";
import {
    DrugBrandSuggestion,
    DrugModelSuggestion,
    InventoryFormData,
    DrugConcentrationDataSuggestion,
    SupplierSuggestion,
} from "@/app/lib/definitions";
import {DrugSuggestionBox} from "@/app/(dashboard)/inventory/_components/DrugSuggestionBox";
import {DrugConcentrationField} from "@/app/(dashboard)/inventory/_components/AddWeightField";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import CustomDrugTypeSelect from "@/app/(dashboard)/inventory/available-stocks/_components/CustomDrugTypeSelect";
import {SupplierSuggestionBox} from "@/app/(dashboard)/inventory/_components/SupplierSuggestionBox";

export function DrugForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<InventoryFormData>({
        brandName: "",
        drugName: "",
        batchNumber: "",
        drugType: "TABLET",
        quantity: "",
        expiry: "",
        retailPrice: "",
        wholesalePrice: "",
        concentration: 0,
        Buffer: 0,
        supplierName: "",
        supplierContact: "",
    });

    const [brandSuggestions, setBrandSuggestions] = useState<
        DrugBrandSuggestion[]
    >([]);
    const [drugSuggestions, setDrugSuggestions] = useState<DrugModelSuggestion[]>(
        []
    );
    const [supplierSuggestions, setSupplierSuggestions] = useState<
        SupplierSuggestion[]
    >([]);
    const [drugConcentrations, setDrugConcentrations] = useState<
        DrugConcentrationDataSuggestion[]
    >([]);
    const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
    const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);
    const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);

    const handleConcentrationAdded = (
        newWeight: DrugConcentrationDataSuggestion
    ) => {
        setDrugConcentrations((prev) => {
            const exists = prev.some((w) => w.id === newWeight.id);
            if (exists) {
                // If the ID exists, update the concentration value
                return prev.map((w) =>
                    w.id === newWeight.id
                        ? {...w, concentration: newWeight.concentration}
                        : w
                );
            }
            // Otherwise, add the new weight
            return [...prev, newWeight];
        });

        // Update the form data with the new weight
        setFormData((prev) => ({
            ...prev,
            concentrationId: newWeight.id,
            concentration: newWeight.concentration,
        }));
    };
    const handleConcentrationDeleted = (
        deleteWeight: DrugConcentrationDataSuggestion
    ) => {
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
    };

    const handleConcentrationChange = (newID: number) => {
        setFormData((prev) => {
            const selectedWeight = drugConcentrations.find(
                (weight) => weight.id === newID
            );
            return {
                ...prev,
                concentrationId: newID,
                concentration: selectedWeight ? selectedWeight.concentration : 0,
            };
        });
    };

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
        } else if (name === "supplierName") {
            if (value.length >= 2) {
                handleSupplierSearch(value).then();
                setShowSupplierSuggestions(true);
            } else {
                setSupplierSuggestions([]);
                setShowSupplierSuggestions(false);
            }
        }
    };

    const handleSupplierSearch = async (query: string) => {
        try {
            const results = await searchSuppliers(query);
            setSupplierSuggestions(results);
        } catch (error) {
            console.error("Error searching suppliers:", error);
            setSupplierSuggestions([]);
        }
    };
    const handleSupplierSelect = (suggestion: SupplierSuggestion) => {
        setFormData((prev) => ({
            ...prev,
            supplierId: suggestion.id,
            supplierName: suggestion.name,
            supplierContact: suggestion.contact || "",
        }));
        setShowSupplierSuggestions(false);
    };

    const fetchDrugWeights = useCallback(async () => {
        if (!formData.drugId) return;

        try {
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
                    drugType: "TABLET",
                    quantity: "",
                    expiry: "",
                    wholesalePrice: "",
                    retailPrice: "",
                    concentration: 0,
                    Buffer: 0,
                    supplierName: "",
                    supplierContact: "",
                });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className="bg-primary-500 hover:bg-primary-600 text-white"
                    onClick={() => setIsOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2"/> Add New Item
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-screen overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary-600 text-center">
                        Add New Drug
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="brandName"
                            className="block text-sm font-medium mb-1"
                        >
                            Brand Name
                        </label>
                        <Input
                            id="brandName"
                            value={formData.brandName}
                            onChange={handleChange}
                            required
                            name="brandName"
                            className={"h-8"}
                        />
                        <DrugSuggestionBox
                            suggestions={brandSuggestions}
                            visible={showBrandSuggestions}
                            onSelect={handleBrandSelect}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="drugName"
                            className="block text-sm font-medium mb-1"
                        >
                            Drug Name
                        </label>
                        <Input
                            id="drugName"
                            value={formData.drugName}
                            onChange={handleChange}
                            required
                            name="drugName"
                            className={"h-8"}
                        />
                        <DrugSuggestionBox
                            suggestions={drugSuggestions}
                            visible={showDrugSuggestions}
                            onSelect={handleDrugSelect}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="Supplier Name"
                            className="block text-sm font-medium mb-1"
                        >
                            Supplier
                        </label>
                        <Input
                            id="supplierName"
                            value={formData.supplierName}
                            onChange={handleChange}
                            required
                            name="supplierName"
                            className={"h-8"}
                        />
                        <SupplierSuggestionBox
                            suggestions={supplierSuggestions}
                            visible={showSupplierSuggestions}
                            onSelect={handleSupplierSelect}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="SupplierContact"
                            className="block text-sm font-medium mb-1"
                        >
                            Supplier Contact
                        </label>
                        <Input
                            id="supplierContact"
                            value={formData.supplierContact}
                            onChange={handleChange}
                            required
                            name="supplierContact"
                            className={"h-8"}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="drugType"
                            className="block text-sm font-medium mb-1"
                        >
                            Drug Type
                        </label>
                        <CustomDrugTypeSelect
                            value={formData.drugType}
                            onValueChange={(value) =>
                                setFormData({...formData, drugType: value})
                            }
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="batchNumber"
                                className="block text-sm font-medium mb-1"
                            >
                                Batch Number
                            </label>
                            <Input
                                id="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleChange}
                                required
                                name="batchNumber"
                                className={"h-8"}
                            />
                        </div>
                        <DrugConcentrationField
                            concentrations={drugConcentrations}
                            drugId={formData.drugId}
                            onChange={handleConcentrationChange}
                            onConcentrationDeleted={handleConcentrationDeleted}
                            onConcentrationAdded={handleConcentrationAdded}
                            selectedConcentrationId={formData.concentrationId}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="quantity"
                                className="block text-sm font-medium mb-1"
                            >
                                Quantity
                            </label>
                            <Input
                                id="quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                name="quantity"
                                min="0"
                                className={"h-8"}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="wholesalePrice"
                                className="block text-sm font-medium mb-1"
                            >
                                Wholesale Price
                            </label>
                            <Input
                                id="wholesalePrice"
                                type="number"
                                step="0.01"
                                value={formData.wholesalePrice}
                                onChange={handleChange}
                                required
                                name="wholesalePrice"
                                min="0"
                                className={"h-8"}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="retailPrice"
                                className="block text-sm font-medium mb-1"
                            >
                                Retail Price
                            </label>
                            <Input
                                id="retailPrice"
                                type="number"
                                step="0.01"
                                value={formData.retailPrice}
                                onChange={handleChange}
                                required
                                name="retailPrice"
                                min="0"
                                className={"h-8"}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="Buffer"
                                className="block text-sm font-medium mb-1"
                            >
                                Buffer
                            </label>
                            <Input
                                id="Buffer"
                                type="number"
                                step="0.01"
                                value={formData.Buffer}
                                onChange={handleChange}
                                required
                                name="Buffer"
                                min="0"
                                className={"h-8"}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="expiry" className="block text-sm font-medium mb-1">
                            Expiry Date
                        </label>
                        <Input
                            id="expiry"
                            type="date"
                            value={formData.expiry}
                            onChange={handleChange}
                            required
                            name="expiry"
                            className={"h-8"}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-primary-500 hover:bg-primary-600"
                    >
                        Add Item
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
