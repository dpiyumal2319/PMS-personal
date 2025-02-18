import React, {Suspense} from "react";
import {DrugForm} from "@/app/(dashboard)/inventory/_components/DrugForm";
import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";
import SortingDropdown from "@/app/(dashboard)/inventory/_components/SortingDropdown";
import AvailableStockPageTable from "./_components/AvailableStockPageTable";
import DrugListSkeleton from "./_components/DrugListSkeleton";

export default async function InventoryAvailable({
                                                     searchParams,
                                                 }: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
        selection?: string;
        sort?: string;
    }>;
}) {
    const params = await searchParams;
    const query = params?.query || "";
    const currentPage = Number(params?.page) || 1;
    const selection = params?.selection || "model";
    const sort = params?.sort || "alphabetically";

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Fixed header instead of sticky */}
            <div className="flex-none bg-white border-b shadow-md">
                <div className="p-4 flex gap-4">
                    <div className="relative w-[200px]">
                        <SearchPanel placeholder="Search by Name"/>
                    </div>
                    <Dropdown
                        items={[
                            {label: "By Model", value: "model"},
                            {label: "By Brand", value: "brand"},
                            {label: "By Batch", value: "batch"},
                        ]}
                        urlParameterName="selection"
                    />
                    <SortingDropdown selection={selection}/>
                    <div>
                        <DrugForm/>
                    </div>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-auto min-h-0">
                <Suspense fallback={<DrugListSkeleton isLoading={true}/>}>
                    <AvailableStockPageTable
                        query={query}
                        currentPage={currentPage}
                        selection={selection}
                        sort={sort}
                    />
                </Suspense>
            </div>
        </div>
    );
}