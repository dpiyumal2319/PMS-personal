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
import {BasicColorType, CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {Button} from "@/components/ui/button";

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
                badgeColor: 'gray' as keyof BasicColorType,
            };
        } else if (drug.availableAmount <= drug.bufferLevel) {
            return {
                headerBg: "bg-red-100",
                statusText: "Low Stock",
                badgeColor: 'red' as keyof BasicColorType
            };
        } else {
            return {
                headerBg: "bg-emerald-100",
                statusText: "In Stock",
                badgeColor: 'emerald' as keyof BasicColorType
            };
        }
    };

    const styles = getStyles();

    const maxRef = Math.max(drug.fullAmount, drug.bufferLevel)
    const stockPercentage = (drug.availableAmount / maxRef) * 100;

    return (
        <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className={`px-4 py-3 ${styles.headerBg}`}>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold text-gray-800">
                        {drug.name}
                    </CardTitle>
                    <CustomBadge text={styles.statusText} className="ml-2" color={styles.badgeColor} inverse/>
                </div>
            </CardHeader>

            <CardContent className="px-4 py-3 grid grid-cols-2 gap-4 text-gray-700">
                <div>
                    <span className="text-sm font-medium text-gray-500">
                        Available / Stocked
                    </span>
                    <p className="text-lg font-semibold">{drug.availableAmount} / {drug.fullAmount}</p>
                </div>
                <div>
                    <span className="text-sm font-medium uppercase text-gray-500">
                        Buffer Level
                    </span>
                    <p className="text-lg font-semibold">{drug.bufferLevel}</p>
                </div>

                {/* Enhanced Stock Level Bar */}
                <div className="col-span-2">
                    <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
                        <span>Stock Level</span>
                        <span>{stockPercentage}%</span>
                    </div>

                    {/* Stock bar container with relative positioning */}
                    <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        {/* Progress bar */}
                        <div
                            className={`h-4 rounded-full transition-all duration-300 ${
                                drug.availableAmount === 0
                                    ? "bg-gray-400"
                                    : drug.availableAmount < drug.bufferLevel
                                        ? "bg-red-500"
                                        : "bg-emerald-500"
                            }`}
                            style={{width: `${stockPercentage}%`}}
                        >
                            {/* Buffer level indicator inside the progress bar */}
                            {drug.bufferLevel > 0 && drug.fullAmount > 0 && (
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-black"
                                    style={{
                                        left: `${Math.min(100, (drug.bufferLevel / maxRef) * 100)}%`,
                                        height: '100%',
                                    }}
                                ></div>
                            )}
                        </div>
                    </div>

                    {/* Buffer status indicator */}
                    <div className="flex items-center mt-2">
                        {drug.availableAmount < drug.bufferLevel ? (
                            <div className="flex items-center text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                                </svg>
                                <span className="text-xs">
                                    {drug.bufferLevel - drug.availableAmount} units below buffer
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                                </svg>
                                <span className="text-xs">
                                    {drug.availableAmount - drug.bufferLevel} units above buffer
                                </span>
                            </div>
                        )}
                    </div>
                    {/*<EnhancedStockLevelIndicator drug={drug}/>*/}
                </div>
            </CardContent>

            <CardFooter className="px-4 py-3">
                <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            className="w-full">
                            Adjust Buffer
                        </Button>
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
