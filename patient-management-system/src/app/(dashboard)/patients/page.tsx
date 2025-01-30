"use client";

import { useState } from "react";

import SearchBox from "../_components/SerchBox";
import Dropdown from "../_components/Dropdown";
import Button from "../_components/Buton";

export default function AllPatientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchParam, setSearchParam] = useState("name");
    const patients: { id: number; name: string; nic: string; tel: string }[] = [
        { id: 1, name: "John Doe", nic: "123456789V", tel: "012-3456789" },
        { id: 2, name: "Jane Smith", nic: "987654321V", tel: "098-7654321" },
    ];

    const handleSearch = (query: string) => setSearchTerm(query);
    const handleParamChange = (param: string) => setSearchParam(param);

    const filteredPatients = patients.filter((patient) =>
        (patient[searchParam as keyof typeof patient] as string)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const dropdownItems = [
        { label: "Search by Name", onClick: () => handleParamChange("name") },
        { label: "Search by NIC", onClick: () => handleParamChange("nic") },
        { label: "Search by Tel Number", onClick: () => handleParamChange("tel") },
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
            <div className="space-y-4">
                {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                        <div
                            key={patient.id}
                            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
                            onClick={() => alert(`Viewing details for ${patient.name}`)}
                        >
                            <h2 className="text-xl font-montserrat font-bold text-primary-600">
                                {patient.name}
                            </h2>
                            <p className="text-gray-600">NIC: {patient.nic}</p>
                            <p className="text-gray-600">Tel: {patient.tel}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No patients found.</p>
                )}
            </div>
        </div>
    );
}
