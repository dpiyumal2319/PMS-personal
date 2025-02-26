"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import DynamicIcon from "@/app/(dashboard)/_components/DynamicIcon";
import iconSsrMapping, {IconName} from "@/app/lib/iconMapping";
import type {BasicColorType} from "@/app/(dashboard)/_components/CustomBadge";
import CustomColorPicker from "@/app/(dashboard)/admin/prescription/_components/CustomColorPicker";
import {ScrollArea} from "@/components/ui/scroll-area";

interface IconSelectorDialogProps {
    buttonClassName?: string;
    children?: React.ReactNode;
    onSelect: (icon: IconName, color: keyof BasicColorType) => void; // Modified to return color
}

const IconSelectorDialog: React.FC<IconSelectorDialogProps> = ({buttonClassName, children, onSelect}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIcon, setSelectedIcon] = useState<IconName | null>(null);
    const [selectedColor, setSelectedColor] = useState<keyof BasicColorType>("slate");
    const [open, setOpen] = useState(false);

    const filteredIcons = Object.keys(iconSsrMapping)
        .filter((icon) => icon.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 100); // Limit the number of displayed icons

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={buttonClassName}>{children || "Select an icon"}</Button>
            </DialogTrigger>
            <DialogContent
                className="lg:max-w-lg overflow-y-auto max-h-screen"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogTitle>Select an icon</DialogTitle>
                <Input
                    type="text"
                    placeholder="Search icons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Color Picker */}
                <div className="">
                    <p className="mb-2 text-sm font-medium">Select Color:</p>
                    <CustomColorPicker selectedColor={selectedColor} onSelectColor={setSelectedColor}/>
                </div>

                <ScrollArea className=" max-h-52">
                    <div className="grid grid-cols-8 gap-4">
                        {filteredIcons.map((icon) => (
                            <button
                                key={icon}
                                onClick={() => {
                                    setSelectedIcon(icon);
                                    onSelect(icon, selectedColor); // Pass icon & color
                                    setOpen(false);
                                }}
                                className={`p-2 rounded border flex flex-col ${
                                    selectedIcon === icon ? "border-primary" : "border-gray-300"
                                }`}
                            >
                                <DynamicIcon
                                    icon={icon}
                                    className={`h-6 w-6 text${selectedColor}-500`}
                                />
                            </button>
                        ))}
                    </div>
                </ScrollArea>

                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default IconSelectorDialog;
