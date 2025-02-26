import React from "react";
import type {basicColorType} from "@/app/(dashboard)/_components/CustomBadge";
import {cn} from "@/lib/utils"; // Assuming cn utility is in utils.ts

const colors: basicColorType = {
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
    selectedColor: keyof basicColorType;
    onSelectColor: (color: keyof basicColorType) => void;
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({selectedColor, onSelectColor}) => {
    return (
        <div className="flex flex-wrap gap-2 p-4">
            {Object.values(colors).map((color) => (
                <div
                    key={color}
                    onClick={() => onSelectColor(color as keyof basicColorType)}
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
