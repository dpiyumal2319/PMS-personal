import React from 'react';
import PrescriptionForm from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";
import {Metadata} from "next";

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

    return (
        <PrescriptionForm patientID={Number(id)}/>
    );
};

export default Page;