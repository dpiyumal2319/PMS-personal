'use client';

import React, {useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Checkbox} from "@/components/ui/checkbox";
import {Plus} from "lucide-react";
import IconSelectorDialog from "@/app/(dashboard)/admin/prescription/_components/IconSelectorDialog";
import {Gender} from "@prisma/client";
import {BasicColorType} from "@/app/(dashboard)/_components/CustomBadge";
import { IconName } from "@/app/lib/iconMapping";

export interface VitalFormData {
    icon: IconName
    color: keyof BasicColorType;
    name: string;
    placeholder: string;
    forGender: Gender | null;
    onlyNumeric: boolean;
}

const AddVitalDialog = () => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<VitalFormData>({
        icon: 'BsActivity',
        color: 'red',
        name: '',
        placeholder: '',
        forGender: null,
        onlyNumeric: false
    });

    const handleIconSelect = (icon: string, color: string) => {
        setFormData({
            ...formData,
            icon,
            color
        });
        setIsIconDialogOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleGenderChange = (value: string) => {
        setFormData({
            ...formData,
            forGender: value === "null" ? null : value as Gender
        });
    };

    const handleNumericChange = (checked: boolean) => {
        setFormData({
            ...formData,
            onlyNumeric: checked
        });
    };

    const handleSubmit = () => {
        console.log('Submitting vital:', formData);
        setOpen(false);
        // Reset form after submission
        setFormData({
            icon: 'heart',
            color: 'red',
            name: '',
            placeholder: '',
            forGender: null,
            onlyNumeric: false
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Card className="border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="flex items-center justify-center h-full p-12">
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Plus className="w-12 h-12"/>
                            <p className="font-medium">Add New Vital</p>
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Vital</DialogTitle>
                    <DialogDescription>
                        Create a new vital sign to track in patient records.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <IconSelectorDialog onSelect={(icon, color) => {
                        console.log('Selected icon:', icon, color);
                    }}/>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Blood Pressure"
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="placeholder" className="text-right">
                            Placeholder
                        </Label>
                        <Input
                            id="placeholder"
                            name="placeholder"
                            value={formData.placeholder}
                            onChange={handleInputChange}
                            placeholder="e.g., 120/80 mmHg"
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">For Gender</Label>
                        <RadioGroup
                            value={formData.forGender || "null"}
                            onValueChange={handleGenderChange}
                            className="flex flex-col space-y-1 col-span-3"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="null" id="gender-all"/>
                                <Label htmlFor="gender-all">All</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="MALE" id="gender-male"/>
                                <Label htmlFor="gender-male">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="FEMALE" id="gender-female"/>
                                <Label htmlFor="gender-female">Female</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <div></div>
                        <div className="flex items-center space-x-2 col-span-3">
                            <Checkbox
                                id="numeric"
                                checked={formData.onlyNumeric}
                                onCheckedChange={handleNumericChange}
                            />
                            <Label htmlFor="numeric">Only allow numeric values</Label>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit}>
                        Add Vital
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddVitalDialog;