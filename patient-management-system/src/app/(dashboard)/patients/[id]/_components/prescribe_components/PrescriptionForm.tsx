'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import IssuesList from "./IssuesList";
import { StrategyJson } from "@/app/lib/definitions";
import { IssueingStrategy } from "@prisma/client";
import AddOffRecordDrugs from "@/app/(dashboard)/patients/[id]/_components/prescribe_components/AddOffRecordDrugs";

export interface IssueInForm {
    batchId: number | null;
    drugId: number;
    brandId: number;
    strategy: IssueingStrategy;
    strategyDetails: StrategyJson;
    quantity: number;
}

export interface OffRecordMeds {
    name: string;
    description: string;
}

export interface PrescriptionFormData {
    presentingSymptoms: string;
    bloodPressure: string;
    pulse: string;
    cardiovascular: string;
    issues: IssueInForm[];
    offRecordMeds: OffRecordMeds[];
}

const PrescriptionForm = () => {
    const [formData, setFormData] = useState<PrescriptionFormData>({
        presentingSymptoms: '',
        bloodPressure: '',
        pulse: '',
        cardiovascular: '',
        issues: [],
        offRecordMeds: []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
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
            console.log('Form data:', formData);
        } catch (error) {
            console.error('Error submitting prescription:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Presenting Symptoms</Label>
                <Input type="text" name="presentingSymptoms" value={formData.presentingSymptoms} onChange={handleChange} required />
            </div>
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Blood Pressure</Label>
                <Input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} />
            </div>
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Pulse</Label>
                <Input type="text" name="pulse" value={formData.pulse} onChange={handleChange} />
            </div>
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Cardiovascular</Label>
                <Input type="text" name="cardiovascular" value={formData.cardiovascular} onChange={handleChange} />
            </div>

            <div className="space-y-4 border-t pt-4">
                <IssuesList onAddIssue={handleAddIssue} />
            </div>

            <div className="space-y-4 border-t pt-4">
                <h3>Off-Record Medications</h3>
                {formData.offRecordMeds.map((med, index) => (
                    <div key={index} className="flex items-center space-x-4">
                        <span>{med.name}</span>
                        <span>{med.description}</span>
                    </div>
                ))}
                <AddOffRecordDrugs addRecord={handleAddOffRecordMed}/>
            </div>

            <Button type="submit" className="w-full">Submit Prescription</Button>
        </form>
    );
};

export default PrescriptionForm;
