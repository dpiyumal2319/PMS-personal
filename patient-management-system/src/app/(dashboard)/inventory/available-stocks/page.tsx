import React, { Suspense } from "react";
import Loading from "@/app/(dashboard)/Loading";

import { DrugForm } from "@/app/(dashboard)/inventory/_components/DrugForm";
import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";

import SortingDropdown from "@/app/(dashboard)/inventory/_components/SortingDropdown";
import AvailableStockPageTable from "./_components/AvailableStockPageTable";
import Pagination from "../../_components/Pagination";
import { getAvailableDrugsTotalPages } from "@/app/lib/actions";
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
    <div className="flex h-full flex-col w-full">
      <div className="sticky top-0 p-4 bg-white border-b shadow-md flex flex-wrap gap-4 z-20">
        <Dropdown
          items={[
            { label: "By Model", value: "model" },
            { label: "By Brand", value: "brand" },
            { label: "By Batch", value: "batch" },
          ]}
          urlParameterName="selection"
        />
        <div className="relative w-[200px]">
          <SearchPanel placeholder="Search by Name" />
        </div>
        <SortingDropdown selection="selection" />
        <div>
          <DrugForm />
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <Suspense fallback={<DrugListSkeleton isLoading={true} />}>
          {" "}
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
