'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import IssuesList from "./IssuesList";

// Define the form state types
interface Issue {
    id: number;
    drugId: number;
    brandId: number;
    strategy: {
        name: 'MEAL' | 'WHEN_NEEDED' | 'PERIODIC' | 'OFF_RECORD' | 'OTHER';
        strategy: any; // Will be typed according to the specific strategy
    };
    quantity: number;
}

interface PrescriptionFormData {
    presentingSymptoms: string;
    bloodPressure: string;
    pulse: string;
    cardiovascular: string;
    issues: Issue[];
}

const PrescriptionForm = () => {
    const [formData, setFormData] = useState<PrescriptionFormData>({
        presentingSymptoms: '',
        bloodPressure: '',
        pulse: '',
        cardiovascular: '',
        issues: []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddIssue = (issue: Issue) => {
        setFormData((prevData) => ({
            ...prevData,
            issues: [...prevData.issues, issue]
        }));
    };

    const handleRemoveIssue = (issueId: number) => {
        setFormData((prevData) => ({
            ...prevData,
            issues: prevData.issues.filter(issue => issue.id !== issueId)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Validate form data
            console.log('Form data:', formData);

            // Handle success (e.g., show success message, redirect, etc.)
        } catch (error) {
            // Handle error (e.g., show error message)
            console.error('Error submitting prescription:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Presenting Symptoms</Label>
                <Input
                    type="text"
                    name="presentingSymptoms"
                    value={formData.presentingSymptoms}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Blood Pressure</Label>
                <Input
                    type="text"
                    name="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={handleChange}
                />
            </div>
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Pulse</Label>
                <Input
                    type="text"
                    name="pulse"
                    value={formData.pulse}
                    onChange={handleChange}
                />
            </div>
            <div className="flex items-center space-x-4">
                <Label className="w-1/3">Cardiovascular</Label>
                <Input
                    type="text"
                    name="cardiovascular"
                    value={formData.cardiovascular}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-4">
                {formData.issues.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-4 border rounded">
                        <div>
                            {/* Display issue details */}
                            <p>Strategy: {issue.strategy.name}</p>
                            <p>Quantity: {issue.quantity}</p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => handleRemoveIssue(issue.id)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}

                <IssuesList
                    onAddIssue={handleAddIssue}
                    existingIssues={formData.issues}
                />
            </div>

            <Button type="submit" className="w-full">Submit Prescription</Button>
        </form>
    );
};

export default PrescriptionForm;