import { getBill, getPrescription } from "@/app/lib/actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CustomBadge } from "@/app/(dashboard)/_components/CustomBadge";
import { Activity, Heart, HeartPulse, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
    OffRecordMedCard,
    PrescriptionIssueCard
} from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/MedicineCards";
import BatchAssign from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/BatchAssign";
import { BillComponent } from "@/app/(dashboard)/_components/Bill";
import { Bill } from "@/app/lib/definitions";
import { verifySession } from "@/app/lib/sessions";
import { BillExport } from "@/app/(dashboard)/_components/BillExport";
import { IoMdDownload } from "react-icons/io";


const Page = async ({ params }: { params: Promise<{ id: string; prescriptionID: string }> }) => {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const prescriptionID = Number(resolvedParams.prescriptionID);
    const prescription = await getPrescription(prescriptionID, id);
    const session = await verifySession();

    if (!prescription) {
        return <div className="text-center text-red-500 font-semibold">Prescription not found</div>;
    }

    let bill: Bill | null = null;

    if (prescription.status === 'COMPLETED') {
        bill = await getBill(prescriptionID);
    }

    return (
        <Card className="p-4">
            <CardHeader className={`flex-row justify-between`}>
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <span>{prescription.presentingSymptoms || "No Symptoms"}</span>
                    <CustomBadge text={`#${prescription.id}`} color="blue" />
                    <CustomBadge
                        text={prescription.status}
                        color={prescription.status === "PENDING" ? "amber" : "green"}
                    />
                </div>
                <div className={`text-gray-500 text-sm`}>
                    {formatDistanceToNow(prescription.time, { addSuffix: true })}
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
                            <HeartPulse className="h-5 w-5 text-red-500" />
                            <span className="font-medium">Blood Pressure:</span>
                            <span className="font-semibold">{prescription.bloodPressure}</span>
                        </div>
                    )}
                    {prescription.pulse && (
                        <div className="flex items-center gap-2 text-gray-700">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">Pulse Rate:</span>
                            <span className="font-semibold">{prescription.pulse}</span>
                        </div>
                    )}
                    {prescription.cardiovascular && (
                        <div className="flex items-center gap-2 text-gray-700">
                            <Heart className="h-5 w-5 text-pink-500" />
                            <span className="font-medium">Cardiovascular:</span>
                            <span className="font-semibold">{prescription.cardiovascular}</span>
                        </div>
                    )}
                </div>

                {/*Prescription Issues*/}
                {prescription.status === "COMPLETED" ? (
                    <>
                        {prescription.issues.length > 0 && (
                            <div className="space-y-4 border-t border-gray-200 pt-4">
                                <span className="text font-semibold">Prescription Issues from Inventory</span>
                                {prescription.issues.map((issue) => (
                                    <PrescriptionIssueCard issue={issue} key={issue.id} />
                                ))}
                            </div>
                        )}

                        {prescription.OffRecordMeds.length > 0 && (
                            <div className="space-y-4 border-t border-gray-200 pt-4">
                                <span className="text font-semibold">Off Record Medications</span>
                                {prescription.OffRecordMeds.map((med) => (
                                    <OffRecordMedCard med={med} key={med.id} />
                                ))}
                            </div>
                        )}
                        <BillComponent bill={bill} />
                        <div className="flex justify-end">
                            <BillExport
                                bill={bill}
                                trigger={
                                    <Button variant="outline" className="flex items-center gap-2 bg-primary text-white">
                                        <IoMdDownload className="w-5 h-5 text-white" />
                                    </Button>
                                }
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {prescription.OffRecordMeds.length > 0 && (
                            <div className="space-y-4 border-t border-gray-200 pt-4">
                                <span className="text font-semibold">Off Record Medications</span>
                                {prescription.OffRecordMeds.map((med) => (
                                    <OffRecordMedCard med={med} key={med.id} />
                                ))}
                            </div>
                        )}
                        <BatchAssign issues={prescription.issues} prescriptionID={prescription.id} patientID={id} role={session.role} />

                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default Page;
