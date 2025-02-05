import SearchBox from "@/app/(dashboard)/_components/Search";
import {getReportPages} from "@/app/lib/actions";
import Pagination from "@/app/(dashboard)/_components/Pagination";
import AllReportsTable from "@/app/(dashboard)/admin/reports/_components/AllReportsTable";
import AddReports from "@/app/(dashboard)/admin/reports/_components/AddReports";

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
        <>
            <div className="w-full p-4 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">All Report Templates</h1>
                    <AddReports />
                </div>

                {/* Search & Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <SearchBox placeholder="Search Reports..." />
                </div>

                {/* Table */}
                <div className="flex-grow overflow-y-auto w-full h-1/2">
                    <AllReportsTable currentPage={currentPage} query={query} />
                </div>
            </div>
            {/* Pagination */}
            <div className="mt-auto flex justify-center py-4 sticky bottom-0">
                <Pagination totalPages={totalPages} itemsPerPage={10} />
            </div>
        </>
    );
}
