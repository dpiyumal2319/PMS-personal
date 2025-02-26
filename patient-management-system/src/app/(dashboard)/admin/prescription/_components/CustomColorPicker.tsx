import React from "react";
import type {BasicColorType} from "@/app/(dashboard)/_components/CustomBadge";
import {cn} from "@/lib/utils"; // Assuming cn utility is in utils.ts

export const iconColors: BasicColorType = {
    slate: "slate",
    gray: "gray",
    zinc: "zinc",
    neutral: "neutral",
    stone: "stone",
    red: "red",
    orange: "orange",
    amber: "amber",
    yellow: "yellow",
    lime: "lime",
    green: "green",
    emerald: "emerald",
    teal: "teal",
    cyan: "cyan",
    sky: "sky",
    blue: "blue",
    indigo: "indigo",
    fuchsia: "fuchsia",
    pink: "pink",
    purple: "purple",
    rose: "rose",
    violet: "violet",
};

interface CustomColorPickerProps {
    selectedColor: keyof BasicColorType;
    onSelectColor: (color: keyof BasicColorType) => void;
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({selectedColor, onSelectColor}) => {
    return (
        <div className="flex flex-wrap gap-2 p-4">
            {Object.values(iconColors).map((color) => (
                <div
                    key={color}
                    onClick={() => onSelectColor(color as keyof BasicColorType)}
                    className={cn(
                        "w-8 h-8 rounded-lg cursor-pointer transition-all",
                        `bg-${color}-500 hover:bg-${color}-600`,
                        selectedColor === color && `border-2 border-${color}-700 shadow-lg`
                    )}
                />
            ))}
        </div>
    );
};

export default CustomColorPicker;
