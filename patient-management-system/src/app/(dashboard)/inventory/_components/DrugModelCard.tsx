"use client";
import React, {useState} from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Input} from "@/components/ui/input";
import {DrugModelsWithBufferLevel} from "@/app/lib/definitions";
import {updateDrugBufferLevel} from "@/app/lib/actions";
import {handleServerAction} from "@/app/lib/utils";

interface DrugModelCardProps {
    drug: DrugModelsWithBufferLevel;
    onBufferLevelChange?: (drugId: number, newBufferLevel: number) => void;
}

export function DrugModelCard({
                                  drug,
                                  onBufferLevelChange,
                              }: DrugModelCardProps) {
    const [newBufferLevel, setNewBufferLevel] = useState(
        drug.bufferLevel.toString()
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async () => {
        const parsedLevel = parseInt(newBufferLevel);
        if (!isNaN(parsedLevel) && parsedLevel >= 0 && onBufferLevelChange) {
            onBufferLevelChange(drug.id, parsedLevel);
        }
        setIsLoading(true);

        try {
            // Use handleServerAction to call the server action with toast notifications
            const result = await handleServerAction(
                () => updateDrugBufferLevel(drug.id, parsedLevel),
                {
                    loadingMessage: "Updating buffer level...",
                    position: "bottom-right",
                }
            );

            if (result && result.success) {
                // Call the parent callback if provided
                if (onBufferLevelChange) {
                    onBufferLevelChange(drug.id, parsedLevel);
                }

                // Close the dialog
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Failed to update buffer level:", error);
            // No need for extra toast here as handleServerAction already handles errors
        } finally {
            setIsLoading(false);
        }
    };

    // Determine status and styles
    const getStyles = () => {
        if (drug.availableAmount === 0) {
            return {
                headerBg: "bg-gray-300",
                statusText: "Out of Stock",
                textColor: "text-gray-600",
            };
        } else if (drug.availableAmount <= drug.bufferLevel) {
            return {
                headerBg: "bg-red-100",
                statusText: "Low Stock",
                textColor: "text-red-600",
            };
        } else {
            return {
                headerBg: "bg-green-100",
                statusText: "In Stock",
                textColor: "text-green-600",
            };
        }
    };

    const styles = getStyles();
    const stockPercentage =
        drug.fullAmount && drug.fullAmount > 0
            ? Math.min(
                100,
                Math.round((drug.availableAmount / drug.fullAmount) * 100)
            )
            : 0; // Default to 0% if fullAmount is undefined or zero

    return (
        <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className={`px-4 py-3 ${styles.headerBg}`}>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold text-gray-800">
                        {drug.name}
                    </CardTitle>
                    <span className={`text-sm font-medium ${styles.textColor}`}>
            {styles.statusText}
          </span>
                </div>
            </CardHeader>

            <CardContent className="px-4 py-3 grid grid-cols-2 gap-4 text-gray-700">
                <div>
          <span className="text-xs font-medium uppercase text-gray-500">
            Available
          </span>
                    <p className="text-lg font-semibold">{drug.availableAmount}</p>
                </div>
                <div>
          <span className="text-xs font-medium uppercase text-gray-500">
            Buffer Level
          </span>
                    <p className="text-lg font-semibold">{drug.bufferLevel}</p>
                </div>
                {/* Stock Level Bar */}
                {/* Stock level visual indicator */}
                <div>
                    <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
                        <span>Stock Level</span>
                        <span>{stockPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                                drug.availableAmount === 0
                                    ? "bg-gray-400"
                                    : drug.availableAmount <= drug.bufferLevel
                                        ? "bg-red-400"
                                        : "bg-green-400"
                            }`}
                            style={{width: `${stockPercentage}%`}}
                        ></div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="px-4 py-3">
                <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                    <AlertDialogTrigger asChild>
                        <button
                            className="w-full py-2 px-4 rounded bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium shadow-md transition-all duration-200">
                            Adjust Buffer
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Adjust Buffer Level</AlertDialogTitle>
                            <AlertDialogDescription>
                                Set the minimum stock threshold for {drug.name}. You will
                                receive alerts when available amount falls below this level.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="py-4">
                            <Input
                                type="number"
                                min="0"
                                value={newBufferLevel}
                                onChange={(e) => setNewBufferLevel(e.target.value)}
                                placeholder="Enter new buffer level"
                                className="w-full"
                            />
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setIsOpen(false)}
                            >Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}
