"use client";

import React, { useRef } from "react";
import { Bill } from "@/app/lib/definitions";
import { BillComponent } from "./Bill";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { IoMdDownload } from "react-icons/io";
import { Button } from "@/components/ui/button";


export function BillExport({ bill, trigger }: { bill: Bill | null; trigger: React.ReactNode }) {
    const billRef = useRef<HTMLDivElement>(null);

    if (!bill) return null;

    const exportToPDF = async () => {
        if (!billRef.current) return;

        const canvas = await html2canvas(billRef.current, { scale: 5 }); // Increase scale for better quality
        const imgData = canvas.toDataURL("image/jpeg");

        // Create PDF in A5 size (148mm × 210mm)
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a5"
        });

        // A5 width is 148mm, set image width with margins
        const pageWidth = 148;
        const marginLeft = 5;
        const marginRight = 5;
        const imgWidth = pageWidth - marginLeft - marginRight;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Center position calculation

        pdf.setFont("helvetica", "normal");
        let yPos = 10;

        pdf.setFontSize(9);
        pdf.text(`Bill ID: ${bill.billID}`, marginLeft + 5, yPos);
        yPos += 8;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.text(`Patient Name: ${bill.patientName}`, marginLeft + 5, yPos);
        yPos += 1;
 
        // Add the image with adjusted margins
        pdf.addImage(imgData, "JPEG", marginLeft, yPos, imgWidth, imgHeight);
        pdf.save(`Bill_${bill.billID}.pdf`);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-lg">

                <div ref={billRef} className="p-4">
                    <BillComponent bill={bill} />
                </div>
                <Button onClick={exportToPDF} className="w-full bg-blue-500 hover:bg-blue-600">
                    <IoMdDownload />
                    Download PDF
                </Button>
            </DialogContent>
        </Dialog>
    );
}
