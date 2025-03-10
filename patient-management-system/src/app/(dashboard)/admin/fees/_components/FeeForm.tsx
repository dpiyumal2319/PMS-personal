'use client';

import React, {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {handleServerAction} from "@/app/lib/utils";
import {updateCharges} from "@/app/lib/actions/charges";
import {ChargeType} from "@prisma/client";

interface FeeFormProps {
    initialDoctorCharge: number;
    initialDispensaryCharge: number;
    initialDoctorUpdatedAt: Date;
    initialDispensaryUpdatedAt: Date;
}

const FeeForm = ({
                     initialDoctorCharge,
                     initialDispensaryCharge,
                     initialDoctorUpdatedAt,
                     initialDispensaryUpdatedAt
                 }: FeeFormProps) => {
    const [doctorCharge, setDoctorCharge] = useState<number>(initialDoctorCharge);
    const [dispensaryCharge, setDispensaryCharge] = useState<number>(initialDispensaryCharge);
    const [doctorUpdatedAt, setDoctorUpdatedAt] = useState<Date>(initialDoctorUpdatedAt);
    const [dispensaryUpdatedAt, setDispensaryUpdatedAt] = useState<Date>(initialDispensaryUpdatedAt);

    // Format date for display
    const formatDate = (date: Date | null) =>
        date ? date.toLocaleString("en-US", {dateStyle: "medium", timeStyle: "short"}) : "Not available";

    // Handle Doctor Charge Update
    const handleDoctorUpdate = async () => {
        const finalDoctorCharge = isNaN(doctorCharge) ? 0 : doctorCharge;
        const newDoctorUpdatedAt = new Date();
        const result = await handleServerAction(() => updateCharges({
            charge: ChargeType.DOCTOR,
            value: finalDoctorCharge
        }), {loadingMessage: "Updating Doctor Charge"});

        if (result.success) {
            setDoctorUpdatedAt(newDoctorUpdatedAt);
            return;
        }
        setDoctorCharge(initialDoctorCharge);
    };

    // Handle Dispensary Charge Update
    const handleDispensaryUpdate = async () => {
        const finalDispensaryCharge = isNaN(dispensaryCharge) ? 0 : dispensaryCharge;
        const newDispensaryUpdatedAt = new Date();
        const result = await handleServerAction(() => updateCharges({
            charge: ChargeType.DISPENSARY,
            value: finalDispensaryCharge
        }), {loadingMessage: "Updating Dispensary Charge"});

        if (result.success) {
            setDispensaryUpdatedAt(newDispensaryUpdatedAt);
            return;
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Update Charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Doctor Charge Section */}
                <div className="border rounded-lg p-4 bg-slate-50">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Charge</label>
                        <div className="flex space-x-2">
                            <Input
                                type="number"
                                value={doctorCharge}
                                onChange={(e) => setDoctorCharge(parseFloat(e.target.value) || 0)}
                                className="flex-grow"
                            />
                            <Button onClick={handleDoctorUpdate} className="whitespace-nowrap">
                                Update
                            </Button>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">Last Updated: {formatDate(doctorUpdatedAt)}</div>
                </div>

                {/* Dispensary Charge Section */}
                <div className="border rounded-lg p-4 bg-slate-50">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dispensary Charge</label>
                        <div className="flex space-x-2">
                            <Input
                                type="number"
                                value={dispensaryCharge}
                                onChange={(e) => setDispensaryCharge(parseFloat(e.target.value) || 0)}
                                className="flex-grow"
                            />
                            <Button onClick={handleDispensaryUpdate} className="whitespace-nowrap">
                                Update
                            </Button>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">Last Updated: {formatDate(dispensaryUpdatedAt)}</div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FeeForm;