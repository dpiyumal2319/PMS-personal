import React from "react";
import Link from "next/link";
import {searchPrescriptions} from "@/app/lib/actions/prescriptions";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {formatDistanceToNow} from "date-fns";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {DynamicIcon, IconName} from "lucide-react/dynamic";

const PrescriptionList = async ({currentPage, query, patientID, perPage, filter}: {
    currentPage: number;
    query: string;
    patientID: number;
    filter: string;
    perPage: number;
}) => {
    const skip = (currentPage - 1) * perPage;
    const prescriptions = await searchPrescriptions({
        patientID,
        query,
        filter: filter,
        take: perPage,
        skip,
    });
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {prescriptions.length > 0 ? (
                prescriptions.map((prescription) => (
                    <Link
                        key={prescription.id}
                        href={`/patients/${patientID}/prescriptions/${prescription.id}`}
                    >
                        <Card className="cursor-pointer hover:shadow-lg transition h-full">
                            <CardHeader className={'pb-2'}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <CardTitle
                                            className="text-lg font-semibold text-gray-900">{prescription.presentingSymptoms || "No Symptoms"}</CardTitle>
                                        <CustomBadge text={`#${prescription.id}`} color="blue"/>
                                        <CustomBadge text={prescription.status}
                                                     color={prescription.status === 'PENDING' ? "amber" : "green"}/>
                                    </div>
                                    <p className="text-gray-500 text-sm">{formatDistanceToNow(new Date(prescription.time), {addSuffix: true})}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <p className="text-gray-500 text-sm">{prescription.details}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {prescription.PrescriptionVitals.map((vital) => (
                                        <div className="flex items-center gap-2 text-gray-700" key={vital.id}>
                                            <DynamicIcon className="h-5 w-5" name={vital.vital.icon as IconName}
                                                         color={vital.vital.color}/>
                                            <span className="font-medium">{vital.vital.name}</span>
                                            <span className="font-semibold">{vital.value}</span>
                                        </div>
                                    ))}
                                </div>
                                {prescription.issues.length > 0 && (
                                    <div className="flex items-center flex-wrap gap-2">
                                        <span className="text-sm">Inventory Meds:</span>
                                        {prescription.issues.map((issue) => (
                                            issue.drug &&
                                            <CustomBadge key={issue.drug.name} text={issue.drug.name} color="rose"/>
                                        ))}
                                    </div>
                                )}
                                {prescription.OffRecordMeds.length > 0 && (
                                    <div className="flex items-center flex-wrap gap-2">
                                        <span className="text-sm">Off Record Meds:</span>
                                        {prescription.OffRecordMeds.map((med) => (
                                            <CustomBadge key={med.name} text={med.name} color="slate"
                                                         className="text-sm"/>
                                        ))}
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    </Link>
                ))
            ) : (
                <p className="text-gray-500">No prescriptions found.</p>
            )}
        </div>
    );
};

export default PrescriptionList;