import {Metadata} from "next";
import Search from "@/app/(dashboard)/_components/Search";
import SearchDropdown from "@/app/(dashboard)/_components/Dropdown";
import React, {Suspense} from "react";
import PrescriptionListSkeleton from "@/app/(dashboard)/patients/[id]/prescriptions/_components/CardsSkeleton";
import HistoryList from "@/app/(dashboard)/patients/[id]/history/_components/HistoryList";
import AddHistoryForm from "@/app/(dashboard)/patients/[id]/history/_components/AddHistoryForm";

export const metadata: Metadata = {
    title: "PMS - Patient History",
    description: "Patient Management System - Patient History",
};

const Page = async ({params, searchParams}: {
    searchParams?: Promise<{
        query?: string;
        filter?: string;
    }>,
    params: Promise<{ id: string }>
}) => {
    const id = Number((await params).id);
    const resolvedParams = await searchParams;
    const query = resolvedParams?.query || "";
    const filter = resolvedParams?.filter || "all";

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            <div className={'flex gap-4 items-center'}>
                <Search placeholder={`Search Patient History by ${filter}...`}/>
                <SearchDropdown items={[
                    {value: "all", label: "All"},
                    {value: "medical", label: "Medical"},
                    {value: "social", label: "Social"},
                    {value: "family", label: "Family"},
                    {value: "allergy", label: "Allergy"}
                ]} urlParameterName="filter"/>
            </div>

            <div className={'flex justify-end gap-4 items-center'}>
                <AddHistoryForm patientID={id}/>
            </div>
            <div className="flex-grow w-full">
                <Suspense fallback={<PrescriptionListSkeleton/>}>
                    <HistoryList query={query} patientID={id} filter={filter}/>
                </Suspense>
            </div>
        </div>
    );
}

export default Page;