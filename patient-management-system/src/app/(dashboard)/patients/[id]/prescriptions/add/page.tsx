import React from 'react';
import PrescriptionForm from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";
import {Metadata} from "next";
import {getPatientSpecificVitals} from "@/app/lib/actions/prescriptions";

export const metadata: Metadata = {
    title: "PMS - Add Prescription",
    description: "Add patient prescription",
};

const Page = async ({
                        params
                    }: {
    params: Promise<{ id: string }>;
}) => {
    const {id} = await params;
    const vitals = (await getPatientSpecificVitals(Number(id))).map(vital => ({
        ...vital,
        value: ''
    }));


    return (
        <PrescriptionForm patientID={Number(id)} vitals={vitals}/>
    );
};

export default Page;