'use client';

import React, {useEffect, useState} from 'react';
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Stethoscope, Heart, Activity, FileText, ChevronLeft} from "lucide-react";
import IssueFromInventory from "./IssueFromInventory";
import {IssuingStrategy, MEAL} from "@prisma/client";
import type {DrugType} from "@prisma/client";
import AddOffRecordDrugs from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/AddOffRecordDrugs";
import {handleServerAction} from "@/app/lib/utils";
import {addPrescription} from "@/app/lib/actions/prescriptions";
import {
    PrescriptionIssuesList,
    OffRecordMedsList
} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionIssuesList";
import {FaHeadSideCough, FaMoneyBill} from "react-icons/fa";
import {useRouter} from "next/navigation";
import {Textarea} from "@/components/ui/textarea";

export interface IssueInForm {
    drugId: number;
    drugName: string;
    details: string | null;
    brandId: number;
    brandName: string;
    meal: MEAL | null;
    dose: number;
    forDays: number | null;
    forTimes: number | null;
    strategy: IssuingStrategy;
    quantity: number;
    drugType: DrugType;
    concentration: number | string;
    concentrationID: number;
}

export interface OffRecordMeds {
    name: string;
    description?: string;
}

export interface PrescriptionFormData {
    presentingSymptoms: string;
    bloodPressure: string;
    description: string;
    extraDoctorCharges: number;
    pulse: string;
    cardiovascular: string;
    issues: IssueInForm[];
    offRecordMeds: OffRecordMeds[];
}

const PrescriptionForm = ({patientID}: { patientID: number }) => {
    const [formData, setFormData] = useState<PrescriptionFormData>(() => {
        if (typeof window !== 'undefined') {
            const savedForm = localStorage.getItem(`prescription-form-${patientID}`);
            if (savedForm) {
                return JSON.parse(savedForm);
            }
        }
        return {
            presentingSymptoms: '',
            bloodPressure: '',
            description: '',
            extraDoctorCharges: 0,
            pulse: '',
            cardiovascular: '',
            issues: [],
            offRecordMeds: []
        };
    });
    const router = useRouter();

    // Save to localStorage whenever formData changes
    useEffect(() => {
        localStorage.setItem(`prescription-form-${patientID}`, JSON.stringify(formData));
    }, [formData, patientID]);

    function formReset() {
        setFormData({
            presentingSymptoms: '',
            bloodPressure: '',
            description: '',
            pulse: '',
            extraDoctorCharges: 0,
            cardiovascular: '',
            issues: [],
            offRecordMeds: []
        });
        localStorage.removeItem(`prescription-form-${patientID}`);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddIssue = (issue: IssueInForm) => {
        setFormData((prevData) => ({
            ...prevData,
            issues: [...prevData.issues, issue]
        }));
    };

    const handleAddOffRecordMed = (offRecordMed: OffRecordMeds) => {
        setFormData((prevData) => ({
            ...prevData,
            offRecordMeds: [...prevData.offRecordMeds, offRecordMed]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await handleServerAction(() => addPrescription({
                prescriptionForm: formData,
                patientID: patientID
            }), {
                loadingMessage: 'Submitting prescription...',
            });

            if (result.success) {
                formReset(); // This will also clear localStorage
            }
        } catch (error) {
            console.error('Error submitting prescription:', error);
        }
    };

    const handleBack = () => {
        // Don't reset the form when going back, to preserve the state
        router.push(`/patients/${patientID}/prescriptions`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card className={'p-4 space-y-4'}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        {/* Back Button */}
                        <div className="flex items-center hover:bg-gray-100 p-1 rounded-md cursor-pointer"
                             onClick={handleBack}>
                            <ChevronLeft/>
                        </div>
                        <h1 className="text-2xl font-semibold">Prescribe Medication</h1>
                    </div>
                    <span onClick={formReset} className="text-red-500 cursor-pointer text-sm hover:underline">
                    X Clear
                </span>
                </div>
                <Card className="bg-slate-100 p-4 hover:shadow-lg transition-shadow duration-300">
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold">Patient Vitals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <FaHeadSideCough className="h-4 w-4 text-cyan-500"/>
                                    <Label>Presenting Symptoms<span className="text-red-500">*</span></Label>
                                </div>
                                <Input
                                    type="text"
                                    name="presentingSymptoms"
                                    value={formData.presentingSymptoms}
                                    onChange={handleChange}
                                    required
                                    className="w-full"
                                    placeholder="Enter symptoms e.g., headache, fever"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Activity className="h-4 w-4 text-amber-500"/>
                                    <Label>Blood Pressure</Label>
                                </div>
                                <Input
                                    type="text"
                                    name="bloodPressure"
                                    value={formData.bloodPressure}
                                    onChange={handleChange}
                                    placeholder="e.g., 120/80"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Heart className="h-4 w-4 text-rose-500"/>
                                    <Label>Pulse</Label>
                                </div>
                                <Input
                                    type="text"
                                    name="pulse"
                                    value={formData.pulse}
                                    onChange={handleChange}
                                    placeholder="e.g., 72 bpm"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Stethoscope className="h-4 w-4 text-emerald-500"/>
                                    <Label>Cardiovascular</Label>
                                </div>
                                <Input
                                    type="text"
                                    name="cardiovascular"
                                    value={formData.cardiovascular}
                                    onChange={handleChange}
                                    placeholder="Enter cardiovascular status..."
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-gray-500"/>
                                    <Label>Description</Label>
                                </div>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-2 rounded-md"
                                    placeholder="Additional details..."
                                />
                            </div>
                            {/*Extra doctor charges*/}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <FaMoneyBill className="h-4 w-4 text-orange-500"/>
                                    <Label>Extra Doctor Charges</Label>
                                </div>
                                <Input
                                    type="number"
                                    name="extraDoctorCharges"
                                    value={formData.extraDoctorCharges}
                                    onChange={handleChange}
                                    placeholder="Enter extra charges..."
                                />
                            </div>

                        </div>
                    </div>
                </Card>

                <Card className='bg-slate-100 p-4 hover:shadow-lg transition-shadow duration-300'>
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold">Medications</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Issue from Inventory</h3>
                            </div>
                            <PrescriptionIssuesList
                                issues={formData.issues}
                                onRemove={(index) => {
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        issues: prevData.issues.filter((_, i) => i !== index)
                                    }));
                                }}
                            />
                            <IssueFromInventory onAddIssue={handleAddIssue}/>
                        </div>

                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Off-Record Medications</h3>
                            </div>
                            <OffRecordMedsList
                                meds={formData.offRecordMeds}
                                onRemove={(index) => {
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        offRecordMeds: prevData.offRecordMeds.filter((_, i) => i !== index)
                                    }));
                                }}
                            />
                            <AddOffRecordDrugs addRecord={handleAddOffRecordMed}/>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="lg"
                        className="px-8"
                    >
                        Submit Prescription
                    </Button>
                </div>
            </Card>
        </form>
    );
};

export default PrescriptionForm;