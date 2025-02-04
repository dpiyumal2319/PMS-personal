import SearchBox from "@/app/(dashboard)/_components/Search";
import {getReportPages} from "@/app/lib/actions";
import Pagination from "@/app/(dashboard)/_components/Pagination";
import { Button } from "@/components/ui/button";
import SearchDropdown from "@/app/(dashboard)/_components/Dropdown";
import AllReportsTable from "@/app/(dashboard)/admin/reports/_components/AllReportsTable";

export default async function Page({
                                       searchParams,
                                   }: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
        filter?: string;
    }>;
}) {
    // Await the searchParams
    const params = await searchParams;
    const query = params?.query || "";
    const currentPage = Number(params?.page) || 1;
    const filter = params?.filter || "abbreviation";
    const totalPages = await getReportPages(query, filter);

    return (
        <>
            <div className="w-full p-4 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">All Report Templates</h1>
                    <Button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                        + Add Patient
                    </Button>
                </div>

                {/* Search & Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <SearchBox placeholder="Search Reports..." />
                    <SearchDropdown
                        items={[
                            { label: "Abbreviation", value: "abbreviation" },
                            { label: "Name", value: "name" },
                        ]}
                        urlParameterName="filter"
                    />
                </div>

                {/* Table */}
                <div className="flex-grow overflow-y-auto w-full h-1/2">
                    <AllReportsTable currentPage={currentPage} query={query} filter={filter} />
                </div>
            </div>
            {/* Pagination */}
            <div className="mt-auto flex justify-center py-4 sticky bottom-0">
                <Pagination totalPages={totalPages} itemsPerPage={10} />
            </div>
        </>
    );
}
