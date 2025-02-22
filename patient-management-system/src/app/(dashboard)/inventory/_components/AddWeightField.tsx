import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Plus, X, Trash2} from "lucide-react";
import {DrugConcentrationDataSuggestion} from "@/app/lib/definitions";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface DrugConcentrationFieldProps {
    concentrations: DrugConcentrationDataSuggestion[];
    selectedConcentrationId?: number;
    drugId?: number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onConcentrationAdded: (concentration: DrugConcentrationDataSuggestion) => void;
    onConcentrationDeleted: (concentrationId: DrugConcentrationDataSuggestion) => void;
}

export function DrugConcentrationField({
                                           concentrations,
                                           selectedConcentrationId,
                                           onChange,
                                           onConcentrationAdded,
                                           onConcentrationDeleted,
                                       }: DrugConcentrationFieldProps) {
    const [showModal, setShowModal] = useState(false);
    const [newConcentration, setNewConcentration] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedConcentrationToDelete, setSelectedConcentrationToDelete] = useState<
        DrugConcentrationDataSuggestion | null
    >(null);

    const uniqueConcentrations = Array.from(
        new Map(concentrations.map((concentration) => [concentration.id, concentration])).values()
    );

    const handleAddConcentration = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!newConcentration) {
            setError("Concentration is required");
            return;
        }

        const concentrationValue = parseFloat(newConcentration);
        if (isNaN(concentrationValue) || concentrationValue <= 0) {
            setError("Please enter a valid concentration");
            return;
        }
        const concentrationExists = uniqueConcentrations.some((w) => w.concentration === concentrationValue);
        if (concentrationExists) {
            setError("This concentration already exists");
            return;
        }

        onConcentrationAdded({
            id: -1,
            concentration: concentrationValue,
        });
        setShowModal(false);
    };

    const handleDeleteConcentration = async () => {
        if (selectedConcentrationToDelete !== null) {
            onConcentrationDeleted(selectedConcentrationToDelete);
        }
        setDeleteDialogOpen(false);
    };

    return (
        <div className="relative">
            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <label htmlFor="concentration" className="block text-sm font-medium mb-1">
                        Drug Concentration
                    </label>
                    <select
                        id="concentration"
                        value={selectedConcentrationId || ""}
                        onChange={onChange}
                        name="concentrationId"
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="">Select Concentration</option>
                        {concentrations.map((concentration) => (
                            <option key={concentration.id} value={concentration.id}>
                                {concentration.concentration} mg
                            </option>
                        ))}
                    </select>
                </div>
                <Button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="bg-primary-500 hover:bg-primary-600"
                >
                    <Plus className="w-4 h-4"/>
                </Button>
            </div>

            {showModal && (
                <div className="absolute right-0 top-0 mt-16 bg-white w-80 p-4 rounded-lg shadow-lg border z-10">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-semibold">Add New Concentration</h3>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <label
                            htmlFor="newConcentration"
                            className="block text-sm font-medium mb-1"
                        >
                            Concentration (mg)
                        </label>
                        <Input
                            id="newConcentration"
                            type="number"
                            value={newConcentration}
                            onChange={(e) => setNewConcentration(e.target.value)}
                            min="0"
                            step="0.1"
                            className="w-full"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end gap-2 ">
                        <Button
                            onClick={handleAddConcentration}
                            className="bg-primary-500 hover:bg-primary-600"
                        >
                            Add
                        </Button>
                    </div>
                    <div className="mt-1">
                        <h4 className="text-sm font-medium mb-2">Existing Concentrations</h4>
                        <div className="max-h-20 overflow-y-auto border rounded-md p-2">
                            {uniqueConcentrations.map((concentration) => (
                                <div
                                    key={concentration.id}
                                    className="flex justify-between items-center py-2 border-b"
                                >
                                    <span>{concentration.concentration} mg</span>
                                    {concentration.id < 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 p-1"
                                            onClick={() => {
                                                setSelectedConcentrationToDelete(concentration);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </Button>
                                    )}
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
                            Are you sure you want to delete this concentration? This action cannot be
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
                        <Button variant="destructive" onClick={handleDeleteConcentration}>
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default DrugConcentrationField;
