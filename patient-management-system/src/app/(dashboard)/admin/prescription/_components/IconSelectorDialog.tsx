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
import type {BasicColorType} from "@/app/(dashboard)/_components/CustomBadge";
import CustomColorPicker from "@/app/(dashboard)/admin/prescription/_components/CustomColorPicker";
import {ScrollArea} from "@/components/ui/scroll-area";
import {IconName, dynamicIconImports, DynamicIcon} from "lucide-react/dynamic";

interface IconSelectorDialogProps {
    buttonClassName?: string;
    children?: React.ReactNode;
    onSelect: (icon: IconName, color: keyof BasicColorType) => void;
}

const IconSelectorDialog: React.FC<IconSelectorDialogProps> = ({buttonClassName, children, onSelect}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIcon, setSelectedIcon] = useState<IconName | null>(null);
    const [selectedColor, setSelectedColor] = useState<keyof BasicColorType>("slate");
    const [open, setOpen] = useState(false);
    const icons = Object.keys(dynamicIconImports) as IconName[];

    const handleIconSelect = (icon: IconName) => {
        setSelectedIcon(icon);
        onSelect(icon, selectedColor);
        setOpen(false); // Close the dialog after selection
    };

    // Filter icons by search term and then limit to 50
    const filteredIcons = icons
        .filter((icon) => icon.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 50);

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

                <ScrollArea className="max-h-52">
                    <div className="grid grid-cols-8 gap-4 p-2">
                        {filteredIcons.map((icon) => (
                            <div
                                key={icon}
                                onClick={() => handleIconSelect(icon)}
                                className={`cursor-pointer p-1 rounded-md ${
                                    selectedIcon === icon ? "bg-gray-200 ring-2 ring-primary" : ""
                                }`}
                            >
                                <DynamicIcon name={icon}
                                             className={`w-8 h-8 ${selectedIcon === icon ? `text-${selectedColor}-600` : ""}`}/>
                            </div>
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