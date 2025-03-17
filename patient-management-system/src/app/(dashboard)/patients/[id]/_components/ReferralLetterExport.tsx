"use client";

import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import getNextReferralId, { fetchPatientData } from "@/app/lib/actions";

export function ReferralLetterExport({ patientId }: { patientId?: number }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        patientName: "",
        age: "",
        address: "",
        conditions: ["", "", ""], // Three conditions
        investigations: "",
        reportDate: new Date().toISOString().split('T')[0],
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch patient data if patientId is provided
        if (patientId) {
            loadPatientData(patientId).then();
        }
    }, [patientId]);

    const loadPatientData = async (id: number) => {
        try {
            setIsLoading(true);
            const patientData = await fetchPatientData(id);

            if (patientData) {
                // Calculate age from birthDate if available
                let age = "";
                if (patientData.birthDate) {
                    const birthDate = new Date(patientData.birthDate);
                    const today = new Date();
                    age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString();
                }

                // Update form with patient data
                setFormData(prev => ({
                    ...prev,
                    patientName: patientData.name || "",
                    address: patientData.address || "",
                    age: age
                }));
            }
        } catch (error) {
            console.error("Error loading patient data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleConditionChange = (index: number, value: string) => {
        const updatedConditions = [...formData.conditions];
        updatedConditions[index] = value;
        setFormData((prev) => ({
            ...prev,
            conditions: updatedConditions,
        }));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const exportToPDF = async () => {
        try {
            const nextReferralId = await getNextReferralId();
            // await storeReferral({
            //     patientId: patientId!, // This is now required
            //     nameOfThePatient: formData.patientName,
            //     addressOfThePatient: formData.address,
            //     conditions: formData.conditions,
            //     investigations: formData.investigations,
            //     ageOfThePatient: formData.age,
            //     reportDate: formData.reportDate,
            // });

            // Generate the PDF
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a5"
            });

            // A5 layout constants
            const pageWidth = 148;
            const centerX = pageWidth / 2;
            const marginLeft = 12;
            const marginRight = 12;
            const contentWidth = pageWidth - marginLeft - marginRight;

            // Set basic fonts and start position
            pdf.setFont("helvetica", "normal");
            let yPos = 10;

            // Add doctor information
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.text("Dr. Dinej Chandrasiri", marginLeft, yPos);
            yPos += 6;

            pdf.text("Registered Medical Officer", marginLeft, yPos);
            yPos += 6;

            pdf.text("SLMC No. 3002", marginLeft, yPos);
            yPos += 6;

            pdf.text("Thoduwawa Medical Center, Church Rd, Thoduwawa", marginLeft, yPos);
            yPos += 13;

            // Add referral title
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Referral Letter", centerX, yPos, { align: "center" });
            yPos += 13;

            // Patient details
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text(`Re: ${formData.patientName || "[Not Provided]"}`, marginLeft, yPos);
            yPos += 6;

            // Conditions
            pdf.text("Please be kind enough to see this patient with the following conditions and do the needful:", marginLeft, yPos);
            yPos += 6;

            formData.conditions.forEach((condition, index) => {
                if (condition) {
                    pdf.text(`${index + 1}. ${condition}`, marginLeft, yPos);
                    yPos += 6;
                }
            });

            // Investigations
            if (formData.investigations) {
                pdf.text(`Investigations: ${formData.investigations}`, marginLeft, yPos);
                yPos += 6;
            }

            // Signature and date
            const signatureY = 170;
            pdf.setFontSize(10);
            pdf.text(`Date: ${formatDate(formData.reportDate)}`, marginLeft, signatureY);

            // Signature line
            pdf.line(pageWidth - 65, signatureY, pageWidth - marginRight, signatureY);
            pdf.setFontSize(9);
            pdf.text("Signature", pageWidth - 38, signatureY + 5, { align: "center" });

            // Footer with referral ID
            pdf.setFontSize(8);
            pdf.text(`Referral ID: REF-${nextReferralId}`, centerX, 190, { align: "center" });

            // Save the PDF with a dynamic filename
            const filename = formData.patientName
                ? `Referral_Letter_${formData.patientName.replace(/\s+/g, '_')}.pdf`
                : 'Referral_Letter.pdf';

            pdf.save(filename);
        } catch (error) {
            console.error("Error saving referral letter:", error);
            alert("Failed to save referral letter. Please check all required fields are filled correctly.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <FileText className="w-5 h-5 text-white" /> Generate Referral Letter
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl h-[90vh] flex flex-col">
                {/* Form Header */}
                <DialogHeader>
                    <div className="bg-primary text-white p-4 rounded-lg">
                        <DialogTitle className="text-xl font-bold text-center">Referral Letter Generator</DialogTitle>
                        <p className="text-center text-blue-100 text-sm">Complete the form below to generate the referral letter</p>
                    </div>
                </DialogHeader>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 rounded-lg">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-blue-600">Loading patient data...</div>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-lg mx-auto">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-blue-700 font-medium mb-3 flex items-center">
                                    <span
                                        className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                                    Patient Information
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Patient Name</label>
                                        <Input
                                            name="patientName"
                                            value={formData.patientName}
                                            onChange={handleChange}
                                            placeholder="Full name"
                                            className="border-gray-300 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Age</label>
                                        <Input
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            type="number"
                                            placeholder="Years"
                                            className="border-gray-300 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700">Address</label>
                                    <Input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Full address"
                                        className="border-gray-300 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-blue-700 font-medium mb-3 flex items-center">
                                    <span
                                        className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                                    Medical Details
                                </h3>

                                {formData.conditions.map((condition, index) => (
                                    <div key={index} className="mb-4">
                                        <label className="text-sm font-medium text-gray-700">Condition {index + 1}</label>
                                        <Input
                                            value={condition}
                                            onChange={(e) => handleConditionChange(index, e.target.value)}
                                            placeholder={`Condition ${index + 1}`}
                                            className="border-gray-300 focus:ring-blue-500"
                                        />
                                    </div>
                                ))}

                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700">Investigations</label>
                                    <Textarea
                                        name="investigations"
                                        value={formData.investigations}
                                        onChange={handleChange}
                                        placeholder="Required investigations"
                                        className="border-gray-300 focus:ring-blue-500 min-h-20"
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-blue-700 font-medium mb-3 flex items-center">
                                    <span
                                        className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                                    Report Details
                                </h3>

                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700">Report Issue Date</label>
                                    <Input
                                        name="reportDate"
                                        value={formData.reportDate}
                                        onChange={handleChange}
                                        type="date"
                                        className="border-gray-300 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit button */}
                <div className="  ">
                    <Button
                        onClick={exportToPDF}
                        className="w-full"
                        disabled={isLoading}
                    >
                        <FileText className="w-5 h-5 mr-2" /> Generate Referral Letter
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}