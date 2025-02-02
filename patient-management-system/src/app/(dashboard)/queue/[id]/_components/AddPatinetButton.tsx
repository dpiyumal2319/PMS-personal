'use client';

import React, {useEffect, useState} from 'react';
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {useDebounce} from "@/hooks/useDebounce";
import {addPatientToQueue, searchPatients} from "@/app/lib/actions";
import type {Patient} from "@prisma/client";
import {calcAge} from "@/app/lib/utils";
import {Badge} from "@/components/ui/badge";
import {TableCell, Table, TableHead, TableHeader, TableRow, TableBody} from "@/components/ui/table";
import {toast} from "react-toastify";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

// Search by types
const AddPatientButton = ({id}: { id: number }) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBy, setSearchBy] = useState<"name" | "telephone" | "NIC">("name");
    const [results, setResults] = useState<Patient[]>([]);
    const [error, setError] = useState<string | null>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const isNumber = (value: string) => {
        return /^\d+$/.test(value);
    }

    useEffect(() => {
        if (searchBy === "NIC") {
            if (searchTerm.length !== 10 && searchTerm.length !== 12) {
                setError("NIC should be 10 or 12 characters long");
                return;
            }
        }

        if (searchBy === "telephone") {
            if (!isNumber(searchTerm)) {
                setError("Telephone should be a number");
                return;
            }

            if (searchTerm.length !== 10) {
                setError("Telephone should be 10 characters long");
                return;
            }
        }

        if (searchBy === "name") {
            if (searchTerm.length < 3) {
                setError("Name should be at least 3 characters long");
                return;
            }
        }

        setError(null);

        const fetchData = async () => {
            const data = await searchPatients(debouncedSearchTerm, searchBy);
            setResults(data);
        }

        fetchData().then(() => {
            console.log("Search results fetched");
        });
    }, [debouncedSearchTerm, searchBy, searchTerm]);

    const getSex = (sex: string) => {
        switch (sex) {
            case 'MALE':
                return <Badge className={'bg-blue-100 text-blue-800 hover:bg-blue-200'}>M</ Badge>;
            case 'FEMALE':
                return <Badge className={'bg-pink-100 text-pink-800 hover:bg-pink-200'}>F</Badge>;
            default:
                return <Badge className={'bg-gray-100 text-gray-800 hover:bg-gray-200'}>UNKNOWN</Badge>;
        }
    }

    const handleAddToQueue = async (patientId: number) => {
        await toast.promise(
            addPatientToQueue(id, patientId),
            {
                pending: 'Adding patient to queue...',
                success: {
                    render() {
                        return 'Patient added to queue successfully';
                    }
                },
                error: {
                    render({data}) {
                        return data instanceof Error ? data.message : 'An error occurred';
                    }
                }
            },
            {
                position: 'bottom-right'
            }
        ).then(() => {
            setOpen(false);
        });
    }

    return (
        <>
            <Button
                className='text-white font-bold disabled:bg-gray-500'
                onClick={() => setOpen(true)}
            >
                Add Patient
            </Button>

            <Dialog open={open} onOpenChange={setOpen} modal={true}>
                <DialogContent className="max-w-5xl max-h-screen flex flex-col justify-start">
                    <DialogHeader>
                        <DialogTitle>Search Patient</DialogTitle>
                    </DialogHeader>
                    {/* Radio Group for Search By Options */}
                    <div className={'flex gap-2'}>
                        <Select
                            value={searchBy}
                            onValueChange={(value) => {
                                setSearchBy(value as "name" | "telephone" | "NIC");
                                setError(null);
                                setSearchTerm("");
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Search by"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="telephone">Mobile</SelectItem>
                                <SelectItem value="NIC">NIC</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Search Input */}
                        <Input
                            placeholder={`Search by ${searchBy.charAt(0).toUpperCase() + searchBy.slice(1)}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>


                    {/*Error message*/}
                    {error && <p className="text-red-500">{error}</p>}

                    {/* Search Results */}
                    <div className="max-h-60 overflow-y-auto mt-2 border rounded">
                        {results.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>SEX</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Telephone</TableHead>
                                        <TableHead>NIC</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((patient) => (
                                        <TableRow
                                            key={patient.id}
                                            className="cursor-pointer hover:bg-gray-50"
                                        >
                                            <TableCell>{patient.name}</TableCell>
                                            <TableCell>{getSex(patient.gender)}</TableCell>
                                            <TableCell>{patient.birthDate ? calcAge(new Date(patient.birthDate)) : "N/A"}</TableCell>

                                            <TableCell>{patient.telephone}</TableCell>
                                            <TableCell>{patient.NIC || "N/A"}</TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleAddToQueue(patient.id)}>
                                                    Add to Queue
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            searchTerm && <p className="p-2 text-gray-500">No results found</p>
                        )}
                    </div>
                    <div className="flex justify-start mt-4">
                        <Button onClick={() => console.log("Redirect to add new patient form")}>
                            Add New Patient
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddPatientButton;
