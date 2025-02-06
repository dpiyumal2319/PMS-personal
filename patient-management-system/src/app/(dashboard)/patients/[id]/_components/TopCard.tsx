import React, {Suspense} from 'react';
import {Card, CardContent} from "@/components/ui/card";
import PatientDetails from "@/app/(dashboard)/patients/[id]/_components/PatientDetails";
import PatientDetailsSkeleton from "@/app/(dashboard)/patients/[id]/reports/_components/PatientDetailsSkeleton";
import Tabs from "@/app/(dashboard)/patients/[id]/_components/Tabs";

const TopCard = ({id}: { id: number }) => {
    return (
        <Card>
            <CardContent className={'p-4'}>
                <Suspense fallback={<PatientDetailsSkeleton/>}>
                    <PatientDetails id={id}/>
                </Suspense>
                <Tabs patientId={id}/>
            </CardContent>
        </Card>
    );
};

export default TopCard;