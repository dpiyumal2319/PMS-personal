import {getBill} from "@/app/lib/actions/bills";
import {getPrescription} from "@/app/lib/actions/prescriptions";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {BasicColorType, CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {ChevronLeft} from "lucide-react";
import {formatDistanceToNow} from "date-fns";
import {
    OffRecordMedCard,
    PrescriptionIssueCard
} from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/MedicineCards";
import BatchAssign from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/BatchAssign";
import {BillComponent} from "@/app/(dashboard)/_components/Bill";
import {Bill} from "@/app/lib/definitions";
import {verifySession} from "@/app/lib/sessions";
import {BillExport} from "@/app/(dashboard)/_components/BillExport";
import {IoMdDownload} from "react-icons/io";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {IconName} from "@/app/lib/iconMapping";
import DynamicIcon from "@/app/(dashboard)/_components/DynamicIcon";
import {getTextColorClass} from "@/app/lib/utils";
import React from "react";
import {Separator} from "@/components/ui/separator";


const Page = async ({params}: { params: Promise<{ id: string; prescriptionID: string }> }) => {
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
            <CardHeader className={`flex-row justify-between pb-2`}>
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <Link href={`/patients/${id}/prescriptions`}
                          className={'cursor-pointer hover:bg-gray-100 p-1 rounded'}>
                        <ChevronLeft size={24}/>
                    </Link>
                    <CardTitle
                        className={'text-2xl font-semibold text-gray-900'}>{prescription.presentingSymptoms || "No Symptoms"}</CardTitle>
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


                <Separator/>

                <div className="grid grid-cols-2 gap-4">
                    {prescription.PrescriptionVitals.map((vital) => (
                        <div className="flex items-center gap-2 text-gray-700" key={vital.id}>
                            <DynamicIcon icon={vital.vital.icon as IconName}
                                         className={`text-2xl ${getTextColorClass(vital.vital.color as keyof BasicColorType)}`}/>
                            <span className="font-medium">{vital.vital.name}</span>
                            <span className="font-semibold">{vital.value}</span>
                        </div>
                    ))}
                </div>


                <Separator/>
                {/*Prescription Issues*/}
                <h2 className="text-xl font-semibold italic">Rx</h2>
                {prescription.status === "COMPLETED" ? (
                    <>
                        {prescription.issues.length > 0 && (
                            <div className="space-y-4 border-t border-gray-200 pt-4">
                                <span className="text font-semibold">Prescription Issues from Inventory</span>
                                {prescription.issues.map((issue) => (
                                    <PrescriptionIssueCard issue={issue} key={issue.id}/>
                                ))}
                            </div>
                        )}

                        <Separator/>

                        {prescription.OffRecordMeds.length > 0 && (
                            <div className="space-y-4 border-t border-gray-200 pt-4">
                                <span className="text font-semibold">Off Record Medications</span>
                                {prescription.OffRecordMeds.map((med) => (
                                    <OffRecordMedCard med={med} key={med.id}/>
                                ))}
                            </div>
                        )}
                        <BillComponent bill={bill}/>
                        <div className="flex justify-end">
                            <BillExport
                                bill={bill}
                                trigger={
                                    <Button>
                                        <IoMdDownload className="w-5 h-5 text-white"/>
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
                                    <OffRecordMedCard med={med} key={med.id}/>
                                ))}
                            </div>
                        )}

                        <Separator/>

                        <BatchAssign issues={prescription.issues} prescriptionID={prescription.id} patientID={id}
                                     role={session.role}/>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default Page;
