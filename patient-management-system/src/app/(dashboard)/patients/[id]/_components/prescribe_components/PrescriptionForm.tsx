'use client';

import React, {useState} from 'react';
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Stethoscope, Heart, Activity, FileText} from "lucide-react";
import IssueFromInventory from "./IssueFromInventory";
import {StrategyJson} from "@/app/lib/definitions";
import {IssueingStrategy} from "@prisma/client";
import AddOffRecordDrugs from "@/app/(dashboard)/patients/[id]/_components/prescribe_components/AddOffRecordDrugs";
import {handleServerAction} from "@/app/lib/utils";
import {addPrescription} from "@/app/lib/actions";
import {
    PrescriptionIssuesList,
    OffRecordMedsList
} from "@/app/(dashboard)/patients/[id]/_components/prescribe_components/PrescriptionIssuesList";

export interface IssueInForm {
    drugId: number;
    drugName: string;
    brandId: number;
    brandName: string;
    strategy: IssueingStrategy;
    strategyDetails: StrategyJson;
    quantity: number;
}

export interface OffRecordMeds {
    name: string;
    description?: string;
}

export interface PrescriptionFormData {
    presentingSymptoms: string;
    bloodPressure: string;
    pulse: string;
    cardiovascular: string;
    issues: IssueInForm[];
    offRecordMeds: OffRecordMeds[];
}

const PrescriptionForm = ({patientID}: { patientID: number }) => {
    const [formData, setFormData] = useState<PrescriptionFormData>({
        presentingSymptoms: '',
        bloodPressure: '',
        pulse: '',
        cardiovascular: '',
        issues: [],
        offRecordMeds: []
    });

    function formReset() {
        setFormData({
            presentingSymptoms: '',
            bloodPressure: '',
            pulse: '',
            cardiovascular: '',
            issues: [],
            offRecordMeds: []
        });
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                formReset();
            }
        } catch (error) {
            console.error('Error submitting prescription:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card className={'p-4 space-y-4'}>
                <Card className="bg-slate-100 p-4 hover:shadow-lg transition-shadow duration-300">
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Patient Vitals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-slate-500"/>
                                    <Label>Presenting Symptoms</Label>
                                </div>
                                <Input
                                    type="text"
                                    name="presentingSymptoms"
                                    value={formData.presentingSymptoms}
                                    onChange={handleChange}
                                    required
                                    className="w-full"
                                    placeholder="Enter symptoms..."
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Activity className="h-4 w-4 text-slate-500"/>
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
                                    <Heart className="h-4 w-4 text-slate-500"/>
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
                                    <Stethoscope className="h-4 w-4 text-slate-500"/>
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
                        </div>
                    </div>
                </Card>

                <Card className='bg-slate-100 p-4 hover:shadow-lg transition-shadow duration-300'>
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Medications</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Issue from Inventory</h3>
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
                                <h3 className="text-lg font-medium">Off-Record Medications</h3>
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