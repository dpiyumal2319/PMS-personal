"use client";

import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDown, Loader2} from "lucide-react";
import {cn} from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popoverModified";
import {addPatientReport, getReportParams, searchReportTypes} from "@/app/lib/actions";
import {useDebouncedCallback} from "use-debounce";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ScrollArea} from "@/components/ui/scroll-area";
import {handleServerAction} from "@/app/lib/utils";

type Report = {
    id: number;
    name: string;
};

type ReportParam = {
    id: number;
    name: string;
    units: string | null;
};

const AddReportDialog = ({id}: { id: number }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<number | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [params, setParams] = useState<ReportParam[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [paramValues, setParamValues] = useState<Record<number, string>>({});
    const [error, setError] = useState<string | null>(null);


    const handleSearch = useDebouncedCallback(async (term: string) => {
        setIsSearching(true);
        try {
            const data = await searchReportTypes(term);
            setReports(data);
        } finally {
            setIsSearching(false);
        }
    }, 700);


    useEffect(() => {
        if (open) {
            handleSearch("");
        }
    }, [handleSearch, open]);

    const handleSelect = async (selectedId: number) => {
        setValue(selectedId === value ? null : selectedId);
        setPopoverOpen(false);
        if (selectedId !== value) {
            setIsSearching(true);
            try {
                const paramsData = await getReportParams(selectedId);
                setParams(paramsData);
                setParamValues({});
            } finally {
                setIsSearching(false);
            }
        }
    };

    const handleParamChange = (paramId: number, paramValue: string) => {
        setParamValues(prev => ({
            ...prev,
            [paramId]: paramValue
        }));
    };

    const handleSubmit = async () => {
        if (!value) {
            setError("Please select a report type");
            return;
        }
        const result = await handleServerAction(() => addPatientReport({
            patientID: id,
            reportTypeID: value,
            params: paramValues
        }), {
            loadingMessage: "Adding report...",
        });

        if (result.success) {
            setParamValues({});
            // 1s delay to show success message
            setTimeout(() => {
                setOpen(false);
            }, 1000);
        } else {
            setError(result.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <span>Add Report</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl flex flex-col justify-start">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add Report</DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div className="space-y-2">
                        <Label>Report Type</Label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={popoverOpen}
                                    className={`w-full justify-between h-10 rounded-lg border-2 transition-all duration-200 ${
                                        value ? "border-primary-500 shadow-sm" : "border-gray-300 hover:border-gray-400"
                                    }`}
                                >
                                    {value ? reports.find((report) => report.id === value)?.name : "Select report type..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Search reports..."
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
                                                "No reports found."
                                            )}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {reports.map((report) => (
                                                <CommandItem
                                                    key={report.id}
                                                    value={String(report.id)}
                                                    onSelect={() => handleSelect(report.id)}
                                                    className="flex items-center justify-between"
                                                >
                                                    <span>{report.name}</span>
                                                    <Check
                                                        className={cn(
                                                            "ml-auto h-4 w-4",
                                                            value === report.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/*Show error*/}
                    {error && <p className="text-red-500">{error}</p>}

                    {(value && params && params.length > 0) && (
                        <div className="space-y-4">
                            <Label>Parameters</Label>
                            <ScrollArea className="h-[240px]">
                                <div className="grid grid-cols-2 gap-4 p-4">
                                    {params.map((param) => (
                                        <div key={param.id} className="grid grid-cols-2 gap-4 items-center">
                                            <Label className="text-sm font-medium">
                                                {param.name}
                                                {param.units && (
                                                    <span className="text-gray-500 ml-1">({param.units})</span>
                                                )}
                                            </Label>
                                            <Input
                                                type="text"
                                                value={paramValues[param.id] || ""}
                                                onChange={(e) => handleParamChange(param.id, e.target.value)}
                                                className="h-9"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!value}>
                        Add Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddReportDialog;