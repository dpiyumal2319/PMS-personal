import React, {Suspense} from "react";
import {getPrescription} from "@/app/lib/actions";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {Activity, Heart, HeartPulse} from "lucide-react";
import {formatDistanceToNow} from "date-fns";
import {
    PrescriptionIssue
} from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/MedicineCards";
import {
    PrescriptionIssueSkeleton
} from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/Skeletons";

const Page = async ({params}: { params: Promise<{ id: string; prescriptionID: string }> }) => {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const prescriptionID = Number(resolvedParams.prescriptionID);
    const prescription = await getPrescription(prescriptionID, id);

    if (!prescription) {
        return <div className="text-center text-red-500 font-semibold">Prescription not found</div>;
    }

    return (
        <Card className="p-4">
            <CardHeader className={`flex-row justify-between`}>
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <span>{prescription.presentingSymptoms || "No Symptoms"}</span>
                    <CustomBadge text={`#${prescription.id}`} color="blue"/>
                    <CustomBadge
                        text={prescription.status}
                        color={prescription.status === "PENDING" ? "amber" : "green"}
                    />
                </div>
                <div className={`text-gray-500 text-sm`}>
                    {formatDistanceToNow(prescription.time, {addSuffix: true})}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {prescription.details && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span className="font-semibold">{prescription.details}</span>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    {prescription.bloodPressure && (
                        <div className="flex items-center gap-2 text-gray-700">
                            <HeartPulse className="h-5 w-5 text-red-500"/>
                            <span className="font-medium">Blood Pressure:</span>
                            <span className="font-semibold">{prescription.bloodPressure}</span>
                        </div>
                    )}
                    {prescription.pulse && (
                        <div className="flex items-center gap-2 text-gray-700">
                            <Activity className="h-5 w-5 text-blue-500"/>
                            <span className="font-medium">Pulse Rate:</span>
                            <span className="font-semibold">{prescription.pulse}</span>
                        </div>
                    )}
                    {prescription.cardiovascular && (
                        <div className="flex items-center gap-2 text-gray-700">
                            <Heart className="h-5 w-5 text-pink-500"/>
                            <span className="font-medium">Cardiovascular:</span>
                            <span className="font-semibold">{prescription.cardiovascular}</span>
                        </div>
                    )}
                </div>

                {/*Prescription Issues*/}
                <div className="space-y-4 border-t border-gray-200 pt-4">
                    <span className="text font-semibold">Prescription Issues from Inventory</span>
                    {prescription.issues.map((issue, index) => (
                        <Suspense fallback={<PrescriptionIssueSkeleton/>}>
                            <PrescriptionIssue issueID={issue.id} key={index}/>
                        </Suspense>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
};

export default Page;
