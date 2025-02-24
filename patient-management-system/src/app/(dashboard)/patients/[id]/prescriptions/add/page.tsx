import React from 'react';
import PrescriptionForm from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";

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