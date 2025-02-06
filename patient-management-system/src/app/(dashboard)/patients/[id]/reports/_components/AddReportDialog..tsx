"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popoverModified";
import { searchReportTypes } from "@/app/lib/actions";

type Report = {
    id: number;
    name: string;
};

const AddReportDialog = ({ id }: { id: number }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<number | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);

    const handleSearch = async (searchTerm: string) => {
        console.log("Searching for:", searchTerm);
        const result = await searchReportTypes(searchTerm);
        console.log("Search result:", result);
        setReports(result); // Update the report list
    };

    const handleSelect = (selectedId: number) => {
        setValue(selectedId === value ? null : selectedId);
        setPopoverOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Report</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Report</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between">
                                {value ? reports.find((report) => report.id === value)?.name : "Select report..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command shouldFilter={false}>
                                <CommandInput placeholder="Search reports..." className="h-9" onValueChange={handleSearch} />
                                <CommandList>
                                    <CommandEmpty>No reports found.</CommandEmpty>
                                    <CommandGroup>
                                        {reports.map((report) => (
                                            <CommandItem key={report.id} value={String(report.id)} onSelect={() => handleSelect(report.id)}>
                                                {report.name}
                                                <Check className={cn("ml-auto h-4 w-4", value === report.id ? "opacity-100" : "opacity-0")} />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <div className="mt-4 flex justify-end">
                        <Button
                            disabled={!value}
                            onClick={() => {
                                console.log("Selected report:", value);
                                setOpen(false);
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddReportDialog;
