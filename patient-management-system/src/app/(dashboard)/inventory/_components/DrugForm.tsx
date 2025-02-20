"use client";
import React, { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addNewItem,
  searchDrugBrands,
  searchDrugModels,
  getDrugWeights,
} from "@/app/lib/actions";
import { Plus, X } from "lucide-react";
import { handleServerAction } from "@/app/lib/utils";
import {
  DrugBrandSuggestion,
  DrugModelSuggestion,
  DrugWeightDataSuggestion,
} from "@/app/lib/definitions";
import { DrugSuggestionBox } from "@/app/(dashboard)/inventory/_components/DrugSuggestionBox";
import { DrugWeightField } from "@/app/(dashboard)/inventory/_components/AddWeightField";

type DrugType = "Tablet" | "Syrup";

interface InventoryFormData {
  brandId?: number;
  brandName: string;

  drugId?: number;
  drugName: string;
  batchNumber: string;
  drugType: DrugType;
  quantity: string;
  expiry: string;
  retailPrice: string;
  wholesalePrice: string;
  weightId?: number;
  weight?: number;
}

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
    weight: 0,
  });

  const [brandSuggestions, setBrandSuggestions] = useState<
    DrugBrandSuggestion[]
  >([]);
  const [drugSuggestions, setDrugSuggestions] = useState<DrugModelSuggestion[]>(
    []
  );
  const [drugWeights, setDrugWeights] = useState<DrugWeightDataSuggestion[]>(
    []
  );
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);

  const handleWeightAdded = (newWeight: DrugWeightDataSuggestion) => {
    // Update the weights list and select the new weight
    setDrugWeights((prev) => {
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
      weight: newWeight.weight,
    }));
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedValue = e.target.type === "number" ? Number(value) : value;
    setFormData((prev) => {
      if (name === "weightId") {
        // Find the selected weight object from the drugWeights array
        const selectedWeight = drugWeights.find(
          (weight) => weight.id === Number(value)
        );

        return {
          ...prev,
          weightId: Number(value),
          weight: selectedWeight ? selectedWeight.weight : 0, // Update the weight value
        };
      }

      return { ...prev, [name]: updatedValue };
    });

    if (name === "brandName") {
      if (value.length >= 2) {
        handleBrandSearch(value);
        setShowBrandSuggestions(true);
      } else {
        setBrandSuggestions([]);
        setShowBrandSuggestions(false);
      }
    } else if (name === "drugName") {
      if (value.length >= 2) {
        handleDrugSearch(value);
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
      const weights = await getDrugWeights(formData.drugId);
      const uniqueWeights = Array.from(
        new Map(weights.map((weight) => [weight.id, weight])).values()
      );
      setDrugWeights(uniqueWeights);
    } catch (error) {
      console.error("Error fetching drug weights:", error);
      setDrugWeights([]);
    }
  }, [formData.drugId]); // Dependencies ensure this function updates when drugId changes

  // Fetch when drugId changes
  useEffect(() => {
    fetchDrugWeights();
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
      const result = await handleServerAction(() => addNewItem({ formData }), {
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
          weight: 0,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <Button
        className="bg-primary-500 hover:bg-primary-600 text-white"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add New Item
      </Button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
          <div className="bg-white w-[600px] p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-center mb-4 text-primary-600">
              Add New Drug
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
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
                  autoComplete="off"
                />
                <DrugSuggestionBox
                  suggestions={brandSuggestions}
                  onSelect={handleBrandSelect}
                  visible={showBrandSuggestions}
                />
              </div>

              <div className="relative">
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
                  autoComplete="off"
                />
                <DrugSuggestionBox
                  suggestions={drugSuggestions}
                  onSelect={handleDrugSelect}
                  visible={showDrugSuggestions}
                />
              </div>
              <DrugWeightField
                weights={drugWeights}
                selectedWeightId={formData.weightId}
                drugId={formData.drugId}
                onChange={handleChange}
                onWeightAdded={handleWeightAdded}
                refetch={fetchDrugWeights}
              />
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
                  />
                </div>

                <div>
                  <label
                    htmlFor="drugType"
                    className="block text-sm font-medium mb-1"
                  >
                    Drug Type
                  </label>
                  <select
                    id="drugType"
                    value={formData.drugType}
                    onChange={handleChange}
                    name="drugType"
                    className="w-full p-2 border rounded"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Syrup">Syrup</option>
                  </select>
                </div>
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
                  />
                </div>

                <div>
                  <label
                    htmlFor="retailPrice"
                    className="block text-sm font-medium mb-1"
                  >
                    Price per Unit
                  </label>
                  <Input
                    id="retailPrice"
                    type="number"
                    step="0.01"
                    value={formData.wholesalePrice}
                    onChange={handleChange}
                    required
                    name="wholesalePrice"
                    min="0"
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
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="expiry"
                  className="block text-sm font-medium mb-1"
                >
                  Expiry Date
                </label>
                <Input
                  id="expiry"
                  type="date"
                  value={formData.expiry}
                  onChange={handleChange}
                  required
                  name="expiry"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600"
              >
                Add Item
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
