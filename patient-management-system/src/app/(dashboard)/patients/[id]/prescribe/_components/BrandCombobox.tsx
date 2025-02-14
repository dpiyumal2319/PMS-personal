'use client';

import React, {useState} from 'react';
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popoverModified";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown, Loader2} from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {cn} from "@/lib/utils";
import {differenceInDays, differenceInMonths} from "date-fns";
import type {BrandOption} from "@/app/(dashboard)/patients/[id]/prescribe/_components/IssueFromInventory";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";

interface BrandComboboxProps {
    options: BrandOption[];
    value?: string | number | null;
    onChange: (value: string | number) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    noOptionsMessage?: string;
    isSearching?: boolean;
    onSearch?: (searchTerm: string) => void;
    className?: string;
    disabled?: boolean;
}

const BrandCombobox = ({
                           options,
                           value,
                           onChange,
                           placeholder = "Select a brand...",
                           searchPlaceholder = "Search brands...",
                           noOptionsMessage = "No brands found.",
                           isSearching = false,
                           onSearch,
                           className,
                           disabled = false,
                       }: BrandComboboxProps) => {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setPopoverOpen(false);
    };

    const handleSearch = (searchTerm: string) => {
        onSearch?.(searchTerm);
    };

    const selectedOption = options.find((option) => option.id === value);

    const formatExpiry = (expiryDate: Date) => {
        const now = new Date();

        const monthsLeft = differenceInMonths(expiryDate, now);
        const daysLeft = differenceInDays(expiryDate, now);

        if (monthsLeft > 0) {
            return `${monthsLeft} month${monthsLeft > 1 ? 's' : ''}`;
        }
        return `${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between h-10 rounded-lg border-2 transition-all duration-200",
                        value
                            ? "border-primary-500 shadow-sm"
                            : "border-gray-300 hover:border-gray-400",
                        className
                    )}
                >
                    {selectedOption ? selectedOption.name : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        onValueChange={handleSearch}
                    />
                    <CommandList>
                        <CommandEmpty className="p-4 text-center">
                            {isSearching ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                    <span>Searching...</span>
                                </div>
                            ) : (
                                noOptionsMessage
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.name}
                                    onSelect={() => handleSelect(String(option.id))}
                                    className="flex space-y-1 rounded-md hover:bg-gray-100 transition"
                                >
                                    <div className="flex items-center min-w-24">
                                        <span className="font-medium">{option.name}</span>
                                    </div>
                                    <div
                                        className="flex items-center justify-between  gap-2 w-full text-sm text-gray-600">
                                        <CustomBadge text={option.batchCount > 1 ? `${option.batchCount} batches` : "1 batch"} color={"gray"}/>
                                        <CustomBadge text={`Total: ${option.totalRemainingQuantity}`}
                                                     color={option.totalRemainingQuantity > 0 ? "green" : "red"}/>
                                        <CustomBadge
                                            text={`Expires in: ${formatExpiry(option.farthestExpiry)}`}
                                            color={
                                                differenceInDays(new Date(option.farthestExpiry), new Date()) < 30
                                                    ? "red"
                                                    : "yellow"
                                            }
                                        />
                                    </div>

                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4 text-primary",
                                            value === option.id ? "opacity-100" : "opacity-0"
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

export default BrandCombobox;
