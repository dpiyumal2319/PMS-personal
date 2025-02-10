import React from 'react';
import EditPatientDataForm from "@/app/(dashboard)/patients/[id]/edit/_components/EditPatientDataForm";

const Page = async ({params}: {
    params: Promise<{ id: string }>
}) => {
    const patientId = Number((await params).id);

    return (
        <div>
            Hello from Edit Patient Page
        </div>
    );
};

export default Page;