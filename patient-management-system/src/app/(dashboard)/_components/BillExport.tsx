"use client";

import React from "react";
import { Bill } from "@/app/lib/definitions";
import jsPDF from "jspdf";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { IoMdDownload } from "react-icons/io";
import { Button } from "@/components/ui/button";

export function BillExport({ bill, trigger }: { bill: Bill | null; trigger: React.ReactNode }) {
    if (!bill) return null;

    const exportToPDF = () => {
        // Initialize PDF with A5 format
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a5"
        });

        // Define colors and styles
        const colors = {
            primary: [45, 55, 72],    // Slate gray
            secondary: [100, 116, 139], // Lighter gray
            accent: [34, 197, 94],    // Green
            divider: [229, 231, 235]  // Light gray
        };

        // Configure initial settings
        const pageWidth = pdf.internal.pageSize.width;
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // Helper function for text alignment
        const centerText = (text: string) => {
            const textWidth = pdf.getTextWidth(text);
            return (pageWidth - textWidth) / 2;
        };

        let yPos = 10; // Starting position


        // Company Name
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.text("Thoduwawa Medical Center", centerText("Thoduwawa Medical Center"), yPos);



        // Bill Information
        yPos += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);

        // Bill header with modern layout
        const billDate = new Date().toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        pdf.setFontSize(10);
        pdf.text(`Bill No: ${bill.billID}`, margin, yPos);
        pdf.text(`Date: ${billDate}`, pageWidth - margin - pdf.getTextWidth(`Date: ${billDate}`), yPos);

        // Patient Information
        yPos += 5;
        pdf.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
        pdf.setLineWidth(0.1);
        pdf.line(margin, yPos, pageWidth - margin, yPos);

        yPos += 7;
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text("Patient Details", margin, yPos);

        yPos += 7;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(bill.patientName, margin, yPos);

        // Items Table Header
        yPos += 6;
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, yPos, contentWidth, 7, 'F');
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("Item", margin + 2, yPos + 5);
        pdf.text("Qty", pageWidth - margin - 35, yPos + 5);
        pdf.text("Amount", pageWidth - margin - 15, yPos + 5);

        // Items
        yPos += 10;
        pdf.setFont("helvetica", "normal");
        bill.entries.forEach((entry) => {
            pdf.setFontSize(9);
            pdf.text(`${entry.drugName}`, margin + 2, yPos);
            pdf.setFontSize(8);
            pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
            pdf.text(`(${entry.brandName})`, margin + 2, yPos + 4);

            pdf.setFontSize(9);
            pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            pdf.text(`${entry.quantity}`, pageWidth - margin - 35, yPos);
            pdf.text(`LKR ${(entry.unitPrice * entry.quantity).toFixed(2)}`, pageWidth - margin - 15, yPos);

            yPos += 8;
        });

        // Summary Section
        yPos += 5;
        pdf.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;

        // Summary Items
        const summaryItems = [
            { label: "Subtotal", value: bill.cost.toFixed(2) },
            { label: "Doctor Fee", value: bill.doctor_charge.toFixed(2) },
            { label: "Dispensary Fee", value: bill.dispensary_charge.toFixed(2) }
        ];

        summaryItems.forEach((item) => {
            pdf.setFontSize(9);
            pdf.text(item.label, pageWidth - margin - 60, yPos);
            pdf.text(`LKR ${item.value}`, pageWidth - margin - 15, yPos);
            yPos += 5;
        });

        // Total
        yPos += 3;
        pdf.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
        pdf.line(pageWidth - margin - 60, yPos, pageWidth - margin, yPos);
        yPos += 5;

        const total = bill.cost + bill.doctor_charge + bill.dispensary_charge;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.text("Total", pageWidth - margin - 60, yPos);
        pdf.text(`LKR ${total.toFixed(2)}`, pageWidth - margin - 15, yPos);

        // Footer
        yPos = pdf.internal.pageSize.height - 20;
        pdf.setFontSize(8);
        pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        pdf.text("Thank you", centerText("Thank you for choosing Thoduwawa Medical Center"), yPos);

        // Save PDF
        const formattedDate = new Date().toISOString().split('T')[0];
        pdf.save(`TMC-Bill-${bill.billID}-${formattedDate}.pdf`);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-sm">
                <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold mb-2">Export Bill</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Download a PDF copy of bill #{bill.billID}
                    </p>
                    <Button
                        onClick={exportToPDF}
                        className="w-full bg-blue-500 hover:bg-blue-600 gap-2"
                    >
                        <IoMdDownload className="w-5 h-5" />
                        Download PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}