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
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);
        pdf.save(`Bill_${bill.patientID}.pdf`);
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
