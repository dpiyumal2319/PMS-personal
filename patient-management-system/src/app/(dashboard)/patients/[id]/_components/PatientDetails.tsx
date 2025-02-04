import React from 'react';
import {getPatientDetails} from "@/app/lib/actions";

const PatientDetails = async ({id}: { id: number }) => {
    const patient = await getPatientDetails(id);

    return (
        <div>

        </div>
    );
};

export default PatientDetails;