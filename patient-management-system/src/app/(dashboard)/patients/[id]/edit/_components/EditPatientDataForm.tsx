"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { UserRoundPen } from "lucide-react";
import {
    FaUser, FaIdCard, FaPhone, FaCalendarAlt, FaMapMarkerAlt,
    FaRuler, FaWeight, FaMars, FaVenus
} from "react-icons/fa";
import { PatientFormData } from "@/app/lib/definitions";
import { handleServerAction } from "@/app/lib/utils";
import { updatePatient } from "@/app/lib/actions";

export default function EditPatientForm({ patientData, id }: { patientData: PatientFormData, id: number }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<PatientFormData>({
        name: patientData.name,
        NIC: patientData.NIC,
        telephone: patientData.telephone,
        birthDate: patientData.birthDate,
        address: patientData.address,
        height: patientData.height,
        weight: patientData.weight,
        gender: patientData.gender,
    });

    const oldData = patientData;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await handleServerAction(() => updatePatient(formData, id), {
            loadingMessage: "Updating Patient...",
        });

        if (result.success) {
            setOpen(false);
            return;
        }

        setFormData(oldData);
    };

    const handleCancel = () => {
        setFormData(oldData);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={'ghost'} >
                    <UserRoundPen/>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <UserRoundPen className="w-6 h-6 mr-2 text-green-600" /> Edit Patient
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white flex items-center border p-3 rounded-md w-full focus-within:ring-2 focus-within:ring-primary">
                            <FaUser className="text-gray-500 mr-3" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name *"
                                required
                                className="w-full focus:outline-none"
                            />
                        </div>

                        <div className="bg-white flex items-center border p-3 rounded-md w-full focus-within:ring-2 focus-within:ring-primary">
                            <FaIdCard className="text-gray-500 mr-3" />
                            <input
                                type="text"
                                name="NIC"
                                value={formData.NIC}
                                onChange={handleChange}
                                placeholder="NIC"
                                className="w-full focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white flex items-center border p-3 rounded-md w-full focus-within:ring-2 focus-within:ring-primary">
                            <FaPhone className="text-gray-500 mr-3" />
                            <input
                                type="text"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                placeholder="Telephone *"
                                required
                                className="w-full focus:outline-none"
                            />
                        </div>

                        <div className="bg-white flex items-center border p-3 rounded-md w-full focus-within:ring-2 focus-within:ring-primary">
                            <FaCalendarAlt className="text-gray-500 mr-3" />
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                required
                                className="w-full focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-white flex items-center border p-3 rounded-md w-full focus-within:ring-2 focus-within:ring-primary">
                        <FaMapMarkerAlt className="text-gray-500 mr-3" />
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Address"
                            className="w-full focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white flex items-center border p-3 rounded-md w-full focus-within:ring-2 focus-within:ring-primary">
                            <FaRuler className="text-gray-500 mr-3" />
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                placeholder="Height (cm)"
                                className="w-full focus:outline-none"
                            />
                        </div>

                        <div className="bg-white flex items-center border p-3 rounded-md w-full focus-within:ring-2 focus-within:ring-primary">
                            <FaWeight className="text-gray-500 mr-3" />
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder="Weight (kg)"
                                className="w-full focus:outline-none"
                            />
                        </div>

                        <div className="bg-white flex items-center border p-3 rounded-md w-full focus-within:ring-2 focus-within:ring-primary">
                            {formData.gender === "MALE" ? (
                                <FaMars className="text-blue-500 mr-3" />
                            ) : formData.gender === "FEMALE" ? (
                                <FaVenus className="text-pink-500 mr-3" />
                            ) : (
                                <FaUser className="text-gray-500 mr-3" />
                            )}

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full focus:outline-none"
                            >
                                <option value="">Select Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Update Patient
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}