import SearchBox from "@/app/(dashboard)/_components/Search";
import {getReportPages} from "@/app/lib/actions";
import Pagination from "@/app/(dashboard)/_components/Pagination";
import AllReportsTable from "@/app/(dashboard)/admin/reports/_components/AllReportsTable";
import AddReports from "@/app/(dashboard)/admin/reports/_components/AddReports";
import {Suspense} from "react";
import SkeletonLoader from "@/app/(dashboard)/admin/reports/_components/LoadingSkeleton";

export default async function Page({
                                       searchParams,
                                   }: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    // Await the searchParams
    const params = await searchParams;
    const query = params?.query || "";
    const currentPage = Number(params?.page) || 1;
    const totalPages = await getReportPages(query);

    return (
        <div className="flex flex-col h-full">
            <div className="w-full p-4 flex-grow flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">All Report Templates</h1>
                    <AddReports/>
                </div>

                {/* Search & Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <SearchBox placeholder="Search Reports..."/>
                </div>

                {/* Table */}
                <div className="flex-grow overflow-y-auto w-full">
                    <Suspense fallback={<SkeletonLoader/>}>
                        <AllReportsTable currentPage={currentPage} query={query}/>
                    </Suspense>
                </div>
            </div>

            {/* Sticky Pagination */}
            <div className="sticky bottom-0 backdrop-blur-sm z-10 py-4">
                <div className="container mx-auto flex justify-center">
                    <Pagination totalPages={totalPages} itemsPerPage={10}/>
                </div>
            </div>
        </div>
    );
}