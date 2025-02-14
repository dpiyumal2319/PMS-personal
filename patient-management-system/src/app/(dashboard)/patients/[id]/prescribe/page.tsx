import React from 'react';
import PrescriptionForm from "@/app/(dashboard)/patients/[id]/prescribe/_components/PrescriptionForm";

const Page = async ({
                        params
                    }: {
    params: Promise<{ id: string }>;
}) => {
    const {id} = await params;

    return (
        <div>
            <PrescriptionForm patientID={Number(id)}/>
        </div>
    );
};

export default Page;