'use client'

import React, {useState} from "react";
import {Button} from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Input} from '@/components/ui/input'
import DynamicIconSsr from "@/app/(dashboard)/_components/DynamicIconSsr";
import iconSsrMapping, {IconName} from "@/app/lib/iconSsrMapping";

interface IconSelectorDialogProps {
    buttonClassName?: string;
    children?: React.ReactNode;
    onSelect: (icon: IconName) => void;
}

const IconSelectorDialog: React.FC<IconSelectorDialogProps> = ({buttonClassName, children, onSelect}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIcon, setSelectedIcon] = useState<IconName | null>(null);
    const [open, setOpen] = useState(false);
    console.log('IconSelectorDialog');

    const filteredIcons = Object.keys(iconSsrMapping).filter((icon) =>
        icon.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={buttonClassName}>{children || "Select an icon"}</Button>
            </DialogTrigger>
            <DialogContent
                className="lg:max-w-(--breakpoint-lg) overflow-y-auto max-h-screen"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogTitle>Select an icon</DialogTitle>
                <DialogDescription>
                    Search for an icon by name. You can browse icons at{" "}
                    <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer">
                        lucide.dev
                    </a>{" "}
                    and search here.
                </DialogDescription>
                <Input
                    type="text"
                    placeholder="Search icons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="grid grid-cols-8 gap-4 mt-4">
                    {filteredIcons.map((icon) => (
                        <button
                            key={icon}
                            onClick={() => {
                                setSelectedIcon(icon);
                                onSelect(icon);
                                setOpen(false);
                            }}
                            className={`p-2 rounded border ${
                                selectedIcon === icon ? "border-primary" : "border-gray-300"
                            }`}
                        >
                            <DynamicIconSsr icon={icon}
                                            className={selectedIcon === icon ? "text-primary" : "text-gray-600"}/>
                            <div className="text-xs text-center mt-1">{icon.replace("Icon", "")}</div>
                        </button>
                    ))}
                </div>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default IconSelectorDialog;
