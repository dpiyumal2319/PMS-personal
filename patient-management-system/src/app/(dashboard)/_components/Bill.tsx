import React from "react";
import {Bill} from "@/app/lib/definitions";
import {Card} from "@/components/ui/card";

export function BillComponent({bill}: { bill: Bill | null }) {
    if (!bill) return null;

    // Calculate subtotal of all costs before discount
    const subtotal = bill.medicineCost + bill.dispensary_charge + bill.doctor_charge;

    // Calculate discount amount
    const discountAmount = (subtotal * bill.discount) / 100;

    // Calculate final total after discount
    const finalTotal = subtotal - discountAmount;

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
                    <span className="text-gray-600">🧾 Medicine Cost:</span>
                    <span className="font-medium text-gray-900">
                        LKR {bill.medicineCost.toFixed(2)}
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
                <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
                    <span>Subtotal:</span>
                    <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                {bill.discount > 0 && (
                    <div className="flex justify-between text-pink-600">
                        <span>🏷️ Discount ({bill.discount}%):</span>
                        <span>- LKR {discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-lg font-bold text-green-600 mt-2 border-t pt-2">
                    <span>💵 Total:</span>
                    <span>LKR {finalTotal.toFixed(2)}</span>
                </div>
            </div>
        </Card>
    );
}