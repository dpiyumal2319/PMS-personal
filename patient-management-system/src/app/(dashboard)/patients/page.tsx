"use client";

import { useState } from 'react';

export default function AllPatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParam, setSearchParam] = useState('name');
  const patients: { id: number; name: string; nic: string; tel: string; }[] = [
    // Dummy patient data
    { id: 1, name: 'John Doe', nic: '123456789V', tel: '012-3456789' },
    { id: 2, name: 'Jane Smith', nic: '987654321V', tel: '098-7654321' },
    // Add more patient objects here
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleParamChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSearchParam(e.target.value);

  const filteredPatients = patients.filter(patient => 
    (patient[searchParam as keyof typeof patient] as string).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <input
            type="text"
            className="p-3 border rounded w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <select
            className="p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchParam}
            onChange={handleParamChange}
          >
            <option value="name">Search by Name</option>
            <option value="nic">Search by NIC</option>
            <option value="tel">Search by Tel Number</option>
          </select>
        </div>
        <button className="bg-primary-500 text-white p-3 rounded hover:bg-primary-400">
          Add New Patient
        </button>
      </div>

      <div className="space-y-4">
        {filteredPatients.map(patient => (
          <div
            key={patient.id}
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
            onClick={() => alert(`Viewing details for ${patient.name}`)}
          >
            <h2 className="text-xl font-montserrat font-bold text-primary-600">{patient.name}</h2>
            <p className="text-gray-600">NIC: {patient.nic}</p>
            <p className="text-gray-600">Tel: {patient.tel}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
