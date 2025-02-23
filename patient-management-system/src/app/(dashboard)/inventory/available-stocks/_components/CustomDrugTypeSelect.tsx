import React, { useState, useRef, useEffect } from "react";
import {ChevronDown, Check, Pill, Milk} from "lucide-react";

export type DrugType = "Tablet" | "Syrup";

interface Option {
    value: DrugType;
    label: string;
    icon: React.ReactNode;
}

interface CustomDrugTypeSelectProps {
    value: DrugType;
    onValueChange: (value: DrugType) => void;
    className?: string;
}

const CustomDrugTypeSelect: React.FC<CustomDrugTypeSelectProps> = ({
                                                                       value,
                                                                       onValueChange,
                                                                       className = "",
                                                                   }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const options: Option[] = [
        {
            value: "Tablet",
            label: "Tablet",
            icon: <Pill className="w-4 h-4 text-green-600" />,
        },
        {
            value: "Syrup",
            label: "Syrup",
            icon: <Milk className="w-4 h-4 text-blue-600" />,
        },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: Option) => {
        onValueChange(option.value);
        setIsOpen(false);
    };

    const selected = options.find((opt) => opt.value === value);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-8 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    isOpen ? "ring-2 ring-primary" : ""
                } ${className}`}
            >
                <span className="flex items-center gap-2">
                    {selected ? (
                        <>
                            {selected.icon}
                            <span>{selected.label}</span>
                        </>
                    ) : (
                        <span className="text-gray-500">Select Drug Type</span>
                    )}
                </span>
                <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
                    <div className="p-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option)}
                                className={`relative flex w-full items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                                    value === option.value ? "bg-accent" : ""
                                }`}
                            >
                                <div className="flex gap-2 items-center">
                                    {option.icon}
                                    <span>{option.label}</span>
                                </div>
                                {value === option.value && (
                                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                                        <Check className="h-4 w-4" />
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDrugTypeSelect;
