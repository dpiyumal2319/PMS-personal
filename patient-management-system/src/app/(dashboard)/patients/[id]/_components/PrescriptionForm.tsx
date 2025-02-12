'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import IssuesList from "@/app/(dashboard)/patients/[id]/_components/IssuesList";

const PrescriptionForm = () => {
    const [formData, setFormData] = useState({
        presentingSymptoms: '',
        bloodPressure: '',
        pulse: '',
        cardiovascular: ''
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

            <IssuesList />
            <Button type="submit" className="w-full">Submit</Button>
        </form>
    );
};

export default PrescriptionForm;
