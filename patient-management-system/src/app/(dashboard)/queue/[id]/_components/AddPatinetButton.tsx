import React from 'react';
import Link from "next/link";
import { getQueue } from "@/app/lib/actions";
import {Button} from "@/components/ui/button";

const AddPatientButton = async ({id}: { id: number }) => {
    const queue = await getQueue(id);

    const disabled = queue?.status === 'COMPLETED';

    return (
        <Link href={`/queue/${id}/add-patient`}>
            <Button className={'bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500'} disabled={disabled}>
                Add Patient
            </Button>
        </Link>
    );
};

export default AddPatientButton;