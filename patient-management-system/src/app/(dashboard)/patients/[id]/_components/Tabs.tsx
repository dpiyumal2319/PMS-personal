"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {ClipboardEdit, FileText, Pill} from "lucide-react";

const PatientTabs = ({ patientId, role }:
                     {
                         patientId: number
                            role: string
                     }) => {
    const router = useRouter();
    const pathname = usePathname();
    const links = role === "DOCTOR" ? DoctorLinks : NurseLinks;

    // Extract the tab name
    const pathParts = pathname.split("/");
    const currentTab = pathParts[3];

    const handleTabChange = (value: string) => {
        console.log(value);
        router.push(`/patients/${patientId}/${value}`);
    };

    return (
        <div className="mt-6 border-t pt-4 h-14">
            <Tabs defaultValue={currentTab} className="w-full h-full">
                <TabsList className="w-full">
                    {links.map((link, index) => (
                        <TabsTrigger key={index} value={link.value} className="flex items-center gap-2 w-full" onClick={() => handleTabChange(link.value)}>
                            <link.icon className="h-4 w-4" />
                            {link.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
};

export default PatientTabs;


const DoctorLinks = [
    {name: "Prescriptions", value: "prescriptions", icon: Pill},
    {name: "Reports", value: "reports", icon: FileText},
    {name: "Notes", value: "notes", icon: ClipboardEdit},
]

const NurseLinks = [
    {name: "Prescriptions", value: "prescriptions", icon: FileText}
]