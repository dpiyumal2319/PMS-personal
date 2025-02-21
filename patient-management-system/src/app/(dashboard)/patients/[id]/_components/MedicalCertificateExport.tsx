"use client";

import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { fetchPatientData } from "@/app/lib/actions";

export function MedicalCertificateExport({ patientId }: { patientId?: number }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        patientName: "",
        age: "",
        address: "",
        workPlace: "",
        disease: "",
        recommendation: "",
        fitForDuty: "No",
        sickDaysCount: "",
        sickDate: "",
        reportDate: new Date().toISOString().split('T')[0],
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch patient data if patientId is provided
        if (patientId) {
            loadPatientData(patientId);
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

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

    const exportToPDF = () => {
        // Create a new jsPDF instance with A5 format
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

        pdf.setFontSize(14);  // Increased from 9
        pdf.setFont("helvetica", "bold");
        pdf.text("Private Medical Certificate", centerX, yPos, { align: "center" });
        yPos += 6;
        
        // Add doctor information - INCREASED FONT SIZE
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);  // Increased from 9
        pdf.text("Dr. Dinej Chandrasiri", centerX, yPos, { align: "center" });
        yPos += 5;
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);  // Increased from 7
        pdf.text("Registered Medical Officer · SLMC No. 3002", centerX, yPos, { align: "center" });
        yPos += 5;
        
        pdf.text("Thoduwawa Medical Center, Church Rd, Thoduwawa", centerX, yPos, { align: "center" });
        yPos += 6;
        
        // Add a divider line
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.3);  // Slightly thicker line
        pdf.line(marginLeft, yPos, pageWidth - marginRight, yPos);
        yPos += 8;
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);  // Increased from 8
        
        // Patient details
        pdf.text(`Name of the Patient: ${formData.patientName || "[Not Provided]"}`, marginLeft, yPos);
        yPos += 6;
        
        pdf.text(`Age: ${formData.age ? formData.age + " years" : "[Not Provided]"}`, marginLeft, yPos);
        yPos += 6;
        
        // Address with proper wrapping for A5
        const addressText = `Address: ${formData.address || "[Not Provided]"}`;
        const addressLines = pdf.splitTextToSize(addressText, contentWidth);
        pdf.text(addressLines, marginLeft, yPos);
        yPos += (addressLines.length * 5) + 1;  // Increased line spacing
        
        // Workplace
        const workplaceText = `Name and Adress of the Work Place: ${formData.workPlace || "[Not Provided]"}`;
        const workplaceLines = pdf.splitTextToSize(workplaceText, contentWidth);
        pdf.text(workplaceLines, marginLeft, yPos);
        yPos += (workplaceLines.length * 5) + 1 ;  // Increased line spacing
        
       
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);  // Increased from 8
        
        // Medical condition with wrapping
        const conditionText = `Nature of the Disease: ${formData.disease || "[Not Provided]"}`;
        const conditionLines = pdf.splitTextToSize(conditionText, contentWidth);
        pdf.text(conditionLines, marginLeft, yPos);
        yPos += (conditionLines.length * 5) + 1;  // Increased line spacing

        
        // Recommendation section
        pdf.text("Recommendation of the medical officer:", marginLeft, yPos);
        yPos += 5;
        
        // Recommendation text - still slightly larger but manageable
        pdf.setFontSize(9.5);  // Increased from 7.5
        const recommendationLines = pdf.splitTextToSize(
            formData.recommendation || "[No recommendation provided]", 
            contentWidth - 4
        );
        pdf.text(recommendationLines, marginLeft + 4, yPos);
        yPos += (recommendationLines.length * 4.5) + 1;  // Increased line spacing
        
        const diseaseText = `Is the person fit for Duty? ${formData.fitForDuty === "Yes" ? "Yes" : "No"}`;
        const dieseaseLines = pdf.splitTextToSize(diseaseText, contentWidth);
        pdf.text(dieseaseLines, marginLeft, yPos);
        yPos += (dieseaseLines.length * 5) + 1;  // Increased line spacing

        
        // Sick leave details if not fit
        if (formData.fitForDuty === "No") {
            pdf.text(`Date of Sickness: ${formatDate(formData.sickDate) || "[Not Provided]"}`, marginLeft, yPos);
            yPos += 6;
            pdf.text(`Recommended Leave: ${formData.sickDaysCount || "[Not Provided]"} days`, marginLeft, yPos);
            yPos += 6;
        }
        
        // Certificate issue date and signature - positioned near bottom
        const signatureY = 170;
        pdf.setFontSize(10);  // Increased from 8
        pdf.text(`Date: ${formatDate(formData.reportDate)}`, marginLeft, signatureY);
        
        // Signature line
        pdf.line(pageWidth - 65, signatureY, pageWidth - marginRight, signatureY);
        pdf.setFontSize(9);  // Increased from 7
        pdf.text("Signature", pageWidth - 38, signatureY + 5, { align: "center" });
        
        // Footer with certificate ID
        pdf.setFontSize(8);  // Increased from 6
        pdf.text(`Certificate ID: MC-${new Date().getTime().toString().substr(-6)}`, centerX, 190, { align: "center" });
        
        // Save the PDF with a dynamic filename
        const filename = formData.patientName
            ? `Medical_Certificate_${formData.patientName.replace(/\s+/g, '_')}.pdf`
            : 'Medical_Certificate.pdf';
        
        pdf.save(filename);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-primary text-white">
                    <FileText className="w-5 h-5 text-white" /> Generate A5 Certificate
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl h-[90vh] flex flex-col">
                {/* Form Header */}
                <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                    <h2 className="text-xl font-bold text-center">A5 Medical Certificate Generator</h2>
                    <p className="text-center text-blue-100 text-sm">Complete the form below to generate an A5-sized certificate</p>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-blue-600">Loading patient data...</div>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-lg mx-auto">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-blue-700 font-medium mb-3 flex items-center">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
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

                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700">Name & Adress of the Work Place</label>
                                    <Input
                                        name="workPlace"
                                        value={formData.workPlace}
                                        onChange={handleChange}
                                        placeholder="Company/Organization name and Address"
                                        className="border-gray-300 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-blue-700 font-medium mb-3 flex items-center">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                                    Medical Details
                                </h3>

                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700">Condition/Disease</label>
                                    <Input
                                        name="disease"
                                        value={formData.disease}
                                        onChange={handleChange}
                                        placeholder="Medical condition"
                                        className="border-gray-300 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700">Medical Recommendation</label>
                                    <Textarea
                                        name="recommendation"
                                        value={formData.recommendation}
                                        onChange={handleChange}
                                        placeholder="Detailed recommendation"
                                        className="border-gray-300 focus:ring-blue-500 min-h-20"
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-blue-700 font-medium mb-3 flex items-center">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                                    Fitness Assessment
                                </h3>

                                <div className="mb-4">
                                    <label className="text-sm font-medium text-gray-700">Fit for Duty?</label>
                                    <select
                                        name="fitForDuty"
                                        value={formData.fitForDuty}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>

                                {formData.fitForDuty === "No" && (
                                    <>
                                        <div className="mb-4">
                                            <label className="text-sm font-medium text-gray-700">Date of Sickness</label>
                                            <Input
                                                name="sickDate"
                                                value={formData.sickDate}
                                                onChange={handleChange}
                                                type="date"
                                                className="border-gray-300 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="text-sm font-medium text-gray-700">Days of Leave Recommended</label>
                                            <Input
                                                name="sickDaysCount"
                                                value={formData.sickDaysCount}
                                                onChange={handleChange}
                                                type="number"
                                                placeholder="Number of days"
                                                className="border-gray-300 focus:ring-blue-500"
                                            />
                                        </div>
                                    </>
                                )}

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
                <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
                    <Button
                        onClick={exportToPDF}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 shadow-md transition-all duration-200"
                        disabled={isLoading}
                    >
                        <FileText className="w-5 h-5 mr-2" /> Generate A5 Certificate
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}