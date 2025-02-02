"use client";

import { useEffect, useState } from "react";
import { getPatients } from "@/app/lib/actions";
import Dropdown from "../_components/Dropdown";
import Button from "../_components/Buton";
import PatientsList from "../patients/_components/PatientsList"; // Import the component
import SearchBox from "../_components/SearchBox";

export default function AllPatientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchParam, setSearchParam] = useState("name");
    const [patients, setPatients] = useState<{ id: number; name: string; NIC: string | null; telephone: string }[]>([]);

    useEffect(() => {
        getPatients().then(setPatients);
    }, []);

    const handleSearch = (query: string) => setSearchTerm(query);
    const handleParamChange = (param: string) => setSearchParam(param);

    const filteredPatients = patients.filter((patient) =>
        (patient[searchParam as keyof typeof patient] as string)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const dropdownItems = [
        { label: "Search by Name", onClick: () => handleParamChange("name") },
        { label: "Search by NIC", onClick: () => handleParamChange("NIC") },
        { label: "Search by Tel Number", onClick: () => handleParamChange("telephone") },
    ];

    return (
        <div className="container mx-auto p-6">
            {/* Search and Dropdown Section */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex justify-stretch items-center gap-4">
                    {/* Search Box */}
                    <SearchBox onSearch={handleSearch} placeholder="Search" />
                    {/* Dropdown */}
                    <Dropdown buttonLabel={`Search by ${searchParam}`} items={dropdownItems} />
                </div>
                {/* Add New Patient Button */}
                <Button label="Add New Patient" onClick={() => alert("Add New Patient clicked")} />
            </div>

            {/* Patients List */}
            <PatientsList patients={filteredPatients} />
        </div>
    );
}
