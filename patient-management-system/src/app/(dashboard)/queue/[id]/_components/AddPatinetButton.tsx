import React from 'react';
import Link from "next/link";
import { getQueue } from "@/app/lib/actions";

const AddPatientButton = async ({id}: { id: number }) => {

    const queue = await getQueue(id);

    if (!queue || queue.status === 'COMPLETED') {
        return null;
    }

    return (
        <Link href={`/queue/${id}/add-patient`}>
            <button className={'bg-primary-500 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded'}>
                Add Patient
            </button>
        </Link>
    );
};

export default AddPatientButton;