import React, {Suspense} from 'react';
import {Card, CardContent} from "@/components/ui/card";
import PatientDetails from "@/app/(dashboard)/patients/[id]/_components/PatientDetails";
import PatientDetailsSkeleton from "@/app/(dashboard)/patients/[id]/reports/_components/PatientDetailsSkeleton";
import Tabs from "@/app/(dashboard)/patients/[id]/_components/Tabs";
import {verifySession} from "@/app/lib/sessions";


const TopCard = async ({id}: { id: number, role: string }) => {
    const session = await verifySession();

    return (
        <Card>
            <CardContent className={'p-4'}>
                <Suspense fallback={<PatientDetailsSkeleton/>}>
                    <PatientDetails id={id}/>
                </Suspense>
                <Tabs patientId={id} role={session.role}/>
            </CardContent>
        </Card>
    );
};

export default TopCard;