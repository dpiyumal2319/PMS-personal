import React from 'react';
import PrescriptionForm from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";
import SidebarHistoryList, {
    SidebarHistoryListSkeleton
} from '@/app/(dashboard)/patients/[id]/prescriptions/add/_components/CompactSidebarHistoryList';
import {Metadata} from "next";
import {getPatientSpecificVitals} from "@/app/lib/actions/prescriptions";
import {Suspense} from 'react';
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import AddHistoryForm from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/CompactAddHistory";
import SearchDropdown from "@/app/(dashboard)/_components/Dropdown";

export const metadata: Metadata = {
    title: "PMS - Add Prescription",
    description: "Add patient prescription",
};

const Page = async ({
                        params,
                        searchParams
                    }: {
    searchParams?: Promise<{
        filter?: string;
    }>,
    params: { id: string };
}) => {
    const {id} = params;
    const patientID = Number(id);
    const filter = (await searchParams)?.filter || '';


    const vitals = (await getPatientSpecificVitals(patientID)).map(vital => ({
        ...vital,
        value: ''
    }));

    return (
        <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
                <PrescriptionForm patientID={patientID} vitals={vitals}/>
            </div>
            <Card className="col-span-1 h-full">
                <CardHeader className={'pb-2 '}>
                    <div className={'flex flex-row justify-center gap-2 items-center text-center'}>
                        <SearchDropdown items={[
                            {value: "all", label: "All"},
                            {value: "medical", label: "Medical"},
                            {value: "social", label: "Social"},
                            {value: "family", label: "Family"},
                            {value: "allergy", label: "Allergy"}
                        ]} urlParameterName="filter"/>
                        <AddHistoryForm patientID={patientID}/>
                    </div>
                </CardHeader>
                <CardContent className={'flex flex-col overflow-y-auto p-3 flex-grow-0'} >
                    <Suspense fallback={<SidebarHistoryListSkeleton/>}>
                        <SidebarHistoryList patientID={patientID} filter={filter}/>
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
        ;
};

export default Page;