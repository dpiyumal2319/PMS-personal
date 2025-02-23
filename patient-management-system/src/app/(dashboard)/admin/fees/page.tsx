import React from 'react';
import FeeForm from "@/app/(dashboard)/admin/fees/_components/FeeForm";
import {getCharges} from "@/app/lib/actions/charges";
import {ChargeType} from "@prisma/client";

const Page = async () => {
    const fees = await getCharges();

    const doctorFee = fees.find(fee => fee.name === ChargeType.DOCTOR);
    const dispensaryFee = fees.find(fee => fee.name === ChargeType.DISPENSARY);

    return (
        <div className={'flex flex-col items-center justify-center h-full'}>
            <FeeForm initialDispensaryCharge={dispensaryFee?.value || 0}
                     initialDispensaryUpdatedAt={dispensaryFee?.updatedAt || new Date()}
                     initialDoctorCharge={doctorFee?.value || 0}
                     initialDoctorUpdatedAt={doctorFee?.updatedAt || new Date()}/>
        </div>
    );
};

export default Page;