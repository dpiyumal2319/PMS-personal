'use client';

import React, {useState} from 'react';
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popoverModified";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown} from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {cn} from "@/lib/utils";
import {CustomDrugType} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/IssueFromInventory";

interface TypeComboBoxProps {
    options: CustomDrugType[];
    value: CustomDrugType | null;
    onChange: (value: CustomDrugType) => void;
    placeholder?: string;
    noOptionsMessage?: string;
    className?: string;
    disabled?: boolean;
}

const DrugTypeComboBox = ({
                              options,
                              value,
                              onChange,
                              placeholder = "Select a drug type...",
                              noOptionsMessage = "No brands found.",
                              className,
                              disabled = false,
                          }: TypeComboBoxProps) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const handleSelect = (selectedValue: CustomDrugType) => {
        onChange(selectedValue);
        setPopoverOpen(false);
    };
    const selectedOption = options.find((option) => option === value);

    console.log("DrugTypeComboBox.tsx: selectedOption: ", selectedOption);
    console.log("DrugTypeComboBox.tsx: options: ", options);

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between h-10 rounded-lg border-2",
                        value
                            ? "border-primary-500 shadow-sm"
                            : "border-gray-300 hover:border-gray-400",
                        className
                    )}
                >
                    {selectedOption?.name ? selectedOption.name : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandList>
                        <CommandEmpty className="p-4 text-center">
                            {noOptionsMessage}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.name}
                                    value={option.name}
                                    onSelect={() => handleSelect(option)}
                                    className="rounded-md hover:bg-gray-100"
                                >
                                    <span
                                        className="font-medium">{option.name}</span>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4 text-primary",
                                            value === option ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default DrugTypeComboBox;
