import React from "react";
import {Bill} from "@/app/lib/definitions";
import {Card} from "@/components/ui/card";

export function BillComponent({bill}: { bill: Bill | null }) {
    if (!bill) return null;

    const total = bill.cost + bill.dispensary_charge + bill.doctor_charge;

    return (
        <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
                💰 Bill Summary
            </h2>

            <div className="space-y-3">
                {bill.entries.map((entry, index) => (
                    <div key={index} className="border-b pb-2 last:border-none">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-700">
                                {entry.drugName} ({entry.brandName})
                            </span>
                            <span className="text-gray-500">
                                LKR {entry.unitPrice.toFixed(2)} × {entry.quantity}
                            </span>
                        </div>
                        <div className="text-right font-semibold text-gray-900">
                            LKR {(entry.unitPrice * entry.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 border-t pt-4 text-sm space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">🧾 Subtotal:</span>
                    <span className="font-medium text-gray-900">
                        LKR {bill.cost.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">🏥 Doctor Fee:</span>
                    <span className="font-medium text-gray-900">
                        LKR {bill.doctor_charge.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">💊 Dispensary Fee:</span>
                    <span className="font-medium text-gray-900">
                        LKR {bill.dispensary_charge.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 mt-2">
                    <span>💵 Total:</span>
                    <span>LKR {total.toFixed(2)}</span>
                </div>
            </div>
        </Card>
    );
}
