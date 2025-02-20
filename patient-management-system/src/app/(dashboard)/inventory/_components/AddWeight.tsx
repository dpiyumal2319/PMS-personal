import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { DrugWeightDataSuggestion } from "@/app/lib/definitions";
import { addNewWeight, addDrugWeight } from "@/app/lib/actions";

interface DrugWeightFieldProps {
  weights: DrugWeightDataSuggestion[];
  selectedWeightId?: number;
  drugId?: number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onWeightAdded: (weight: DrugWeightDataSuggestion) => void;
}

export function DrugWeightField({
  weights,
  selectedWeightId,
  drugId,
  onChange,
  onWeightAdded,
}: DrugWeightFieldProps) {
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newWeight) {
      setError("Weight is required");
      return;
    }

    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue <= 0) {
      setError("Please enter a valid weight");
      return;
    }

    try {
      // Add new weight to Weights table
      const addedWeight = await addNewWeight(weightValue);

      // If drug is selected, create relationship
      if (drugId) {
        await addDrugWeight(drugId, addedWeight.id);
      }

      // Update parent component
      onWeightAdded(addedWeight);

      // Reset and close modal
      setNewWeight("");
      setShowModal(false);
    } catch (error) {
      setError("Failed to add weight");
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label htmlFor="weight" className="block text-sm font-medium mb-1">
            Drug Weight
          </label>
          <select
            id="weight"
            value={selectedWeightId || ""}
            onChange={onChange}
            name="weightId"
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Weight</option>
            {weights.map((weight) => (
              <option key={weight.id} value={weight.id}>
                {weight.weight} mg
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-primary-500 hover:bg-primary-600"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {showModal && (
        <div className="absolute right-0 top-0 mt-16 bg-white w-80 p-4 rounded-lg shadow-lg border z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add New Weight</h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddWeight} className="space-y-4">
            <div>
              <label
                htmlFor="newWeight"
                className="block text-sm font-medium mb-1"
              >
                Weight (mg)
              </label>
              <Input
                id="newWeight"
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                min="0"
                step="0.1"
                required
                className="w-full"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600"
              >
                Add
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
