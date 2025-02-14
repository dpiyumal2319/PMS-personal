import React, {Suspense} from 'react';
import {getPrescriptionsCount, searchPrescriptionCount} from "@/app/lib/actions";
import Search from "@/app/(dashboard)/_components/Search";
import SearchDropdown from "@/app/(dashboard)/_components/Dropdown";
import PrescriptionList from "@/app/(dashboard)/patients/[id]/prescriptions/_components/PrescriptionList";
import Pagination from "@/app/(dashboard)/_components/Pagination";
import PrescriptionListSkeleton from "@/app/(dashboard)/patients/[id]/prescriptions/_components/CardsSkeleton";

const Page = async ({searchParams, params}: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
        filter?: string;
    }>,
    params: Promise<{ id: string }>
}) => {
    const recordsPerPage = 10
    const id = Number((await params).id);
    const resolvedParams = await searchParams;
    const query = resolvedParams?.query || "";
    const currentPage = Number(resolvedParams?.page) || 1;
    const filter = resolvedParams?.filter || "symptom";
    const prescriptionsCount = await getPrescriptionsCount(id);
    const filteredCount = await searchPrescriptionCount({
        query: query,
        patientID: id,
        filter: filter
    })


    return (
        <div className={'flex flex-col flex-grow gap-4 h-full'}>
            <div className={'flex justify-start items-center gap-4'}>
                <span className={'text-md'}>There are total {prescriptionsCount} prescriptions</span>
            </div>
            <div className={'flex gap-4 items-center'}>
                <Search placeholder={`Search Prescription by ${filter}...`}/>
                <SearchDropdown items={[
                    {label: "Symptom", value: "symptom"},
                    {label: "Medicine", value: "drug"},
                ]} urlParameterName="filter"/>
            </div>

            <div className="flex-grow overflow-y-auto w-full">
                <Suspense fallback={<PrescriptionListSkeleton/>}>
                    <PrescriptionList currentPage={currentPage} query={query} patientID={id} perPage={recordsPerPage}
                                      filter={filter}/>
                </Suspense>
            </div>

            <div className={'flex justify-center items-center sticky bottom-0'}>
                <Pagination totalPages={Math.ceil(filteredCount / recordsPerPage)} itemsPerPage={recordsPerPage}/>
            </div>
        </div>
    );
};

export default Page;