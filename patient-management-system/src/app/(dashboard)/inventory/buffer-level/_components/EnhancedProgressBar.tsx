import React from 'react';
import {DrugModelsWithBufferLevel} from "@/app/lib/definitions";

const EnhancedStockLevelIndicator = ({drug}: { drug: DrugModelsWithBufferLevel }) => {
    // Calculate percentages
    const maxRef = drug.fullAmount || 1;
    const stockPercentage = Math.round((drug.availableAmount / maxRef) * 100);

    // Determine status for styling
    const getStatusColor = () => {
        if (drug.availableAmount === 0) return "bg-gray-400";
        if (drug.availableAmount < drug.bufferLevel) return "bg-red-500";
        return "bg-emerald-500";
    };

    // Get text status
    const getStatusText = () => {
        if (drug.availableAmount === 0) return "Out of Stock";
        if (drug.availableAmount < drug.bufferLevel) return "Low Stock";
        return "In Stock";
    };

    return (
        <div className="w-full p-4 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">Stock Level</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                        drug.availableAmount === 0 ? "bg-gray-200 text-gray-700" :
                            drug.availableAmount < drug.bufferLevel ? "bg-red-100 text-red-800" :
                                "bg-emerald-100 text-emerald-800"
                    }`}>
            {getStatusText()}
          </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{stockPercentage}%</span>
            </div>

            {/* Stock bar container with improved styling */}
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                {/* Progress bar with gradient and smoother animation */}
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${getStatusColor()} relative overflow-hidden`}
                    style={{width: `${stockPercentage}%`}}
                >
                    {/* Buffer level indicator with improved visibility */}
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

            {/* Additional information below the bar */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
                <div>
                    <span className="font-medium">Available: </span>
                    <span>{drug.availableAmount} units</span>
                </div>
                <div>
                    <span className="font-medium">Buffer: </span>
                    <span>{drug.bufferLevel} units</span>
                </div>
            </div>
        </div>
    );
};

export default EnhancedStockLevelIndicator;