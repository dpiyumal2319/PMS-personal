import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Trash2 } from "lucide-react";
import { DrugWeightDataSuggestion } from "@/app/lib/definitions";
import { addNewWeight, addDrugWeight, deleteWeight } from "@/app/lib/actions";
import { handleServerAction } from "@/app/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface DrugWeightFieldProps {
  weights: DrugWeightDataSuggestion[];
  selectedWeightId?: number;
  drugId?: number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onWeightAdded: (weight: DrugWeightDataSuggestion) => void;
  refetch: () => void;
}

export function DrugWeightField({
  weights,
  selectedWeightId,
  drugId,
  onChange,
  onWeightAdded,
  refetch,
}: DrugWeightFieldProps) {
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWeightToDelete, setSelectedWeightToDelete] = useState<
    number | null
  >(null);

  const uniqueWeights = Array.from(
    new Map(weights.map((weight) => [weight.id, weight])).values()
  );

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
    const weightExists = uniqueWeights.some((w) => w.weight === weightValue);
    if (weightExists) {
      setError("This weight already exists");
      return;
    }

    try {
      const result = await handleServerAction(
        async () => {
          const addedWeight = await addNewWeight(weightValue);

          if (drugId) {
            await addDrugWeight(drugId, addedWeight.id);
          }

          await refetch();
          onWeightAdded(addedWeight);

          return {
            success: true,
            message: `Successfully added weight: ${weightValue}mg`,
          };
        },
        {
          loadingMessage: "Adding new weight...",
          position: "bottom-right",
        }
      );

      if (result.success) {
        setNewWeight("");
        setError("");
        setShowModal(false);
      }
    } catch (error) {
      setError("Failed to add weight");
    }
  };

  const handleDeleteWeight = async () => {
    if (selectedWeightToDelete !== null) {
      await handleServerAction(
        async () => {
          const result = await deleteWeight(selectedWeightToDelete);
          if (result.success) {
            await refetch();
          }
          return result;
        },
        {
          loadingMessage: "Deleting weight...",
          position: "bottom-right",
        }
      );
    }
    setDeleteDialogOpen(false);
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
          <div className="flex justify-between items-center mb-1">
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
            <div className="flex justify-end gap-2 ">
              <Button
                onClick={handleAddWeight}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Add
              </Button>
            </div>
          </form>
          <div className="mt-1">
            <h4 className="text-sm font-medium mb-2">Existing Weights</h4>
            <div className="max-h-20 overflow-y-auto border rounded-md p-2">
              {uniqueWeights.map((weight) => (
                <div
                  key={weight.id}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <span>{weight.weight} mg</span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 p-1"
                    onClick={() => {
                      setSelectedWeightToDelete(weight.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this weight? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWeight}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
export default DrugWeightField;
