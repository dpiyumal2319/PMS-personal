import React from "react";
import Link from "next/link";
import {searchPrescriptions} from "@/app/lib/actions/prescriptions";
import {Card, CardContent} from "@/components/ui/card";
import {formatDistanceToNow} from "date-fns";
import {CustomBadge} from "@/app/(dashboard)/_components/CustomBadge";
import {Activity, Heart, HeartPulse} from "lucide-react";

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
        <div className="grid grid-cols-2 gap-4">
            {prescriptions.length > 0 ? (
                prescriptions.map((prescription) => (
                    <Link
                        key={prescription.id}
                        href={`/patients/${patientID}/prescriptions/${prescription.id}`}
                    >
                        <Card className="p-4 cursor-pointer hover:shadow-lg transition h-full">
                            <CardContent className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-semibold">{prescription.presentingSymptoms || "No Symptoms"}</h3>
                                        <CustomBadge text={`#${prescription.id}`} color="blue"/>
                                        <CustomBadge text={prescription.status} color={prescription.status === 'PENDING' ? "amber" : "green"}/>
                                    </div>
                                    <p className="text-gray-500 text-sm">{formatDistanceToNow(new Date(prescription.time), {addSuffix: true})}</p>
                                </div>
                                <p className="text-gray-500 text-sm">{prescription.details}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {prescription.bloodPressure && (
                                        <p className="flex items-center text-sm text-gray-600 space-x-1">
                                            <HeartPulse className="h-4 w-4 text-red-500"/>
                                            <span>BP: <span
                                                className="font-semibold">{prescription.bloodPressure}</span></span>
                                        </p>
                                    )}
                                    {prescription.pulse && (
                                        <p className="flex items-center text-sm text-gray-600 space-x-1">
                                            <Activity className="h-4 w-4 text-blue-500"/>
                                            <span>PR: <span className="font-semibold">{prescription.pulse}</span></span>
                                        </p>
                                    )}
                                    {prescription.cardiovascular && (
                                        <p className="flex items-center text-sm text-gray-600 space-x-1">
                                            <Heart className="h-4 w-4 text-pink-500"/>
                                            <span>CV: <span
                                                className="font-semibold">{prescription.cardiovascular}</span></span>
                                        </p>
                                    )}
                                </div>
                                {prescription.issues.length > 0 && (
                                    <div className="flex items-center flex-wrap gap-2">
                                        <span className="text-sm">Inventory Meds:</span>
                                        {prescription.issues.map((issue) => (
                                            issue.drug &&
                                            <CustomBadge key={issue.drug.name} text={issue.drug.name} color="green"
                                                         className="text-sm"/>
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