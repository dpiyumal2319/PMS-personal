

import React, { Suspense } from "react";

import { DrugForm } from "@/app/(dashboard)/inventory/_components/DrugForm";
import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";

import SortingDropdown from "@/app/(dashboard)/inventory/_components/SortingDropdown";
import CompletedStockPageTable from "@/app/(dashboard)/inventory/completed-stocks/_components/CompletedStockPageTable";
import DrugListSkeleton from "@/app/(dashboard)/inventory/available-stocks/_components/DrugListSkeleton";
import DatePickerURL from "./_components/DatePickerURL";

export default async function InventoryAvailable({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    selection?: string;
    sort?: string;
    status?: string;
    from: string;
    to: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const currentPage = Number(params?.page) || 1;
  const selection = params?.selection || "model";
  const sort = params?.sort || "alphabetically";
  const status = params?.status || "ALL";
  const fromDate = params?.from || "";  // Get from date
  const toDate = params?.to || "";      // Get to date

  return (
    <div className="flex h-full flex-col w-full">
      <div className="sticky top-0 p-4 bg-white border-b shadow-md flex gap-4 z-20">
        <div className="relative w-[200px]">
          <SearchPanel placeholder="Search..." />
        </div>
        <Dropdown
          items={[
            { label: "Search by Model", value: "model" },
            { label: "Search by Brand", value: "brand" },
            { label: "Search by Batch", value: "batch" },
          ]}
          urlParameterName="selection"
        />

        <div>
          <Dropdown
            items={[
              { label: "Expiry Date", value: "expiryDate" },
              { label: "Newly Added", value: "newlyAdded" },
              { label: "Alphabetically", value: "alphabetically" },
            ]}
            urlParameterName="sort"
          />
        </div>
        <div>
          <Dropdown
            items={[
              { label: "All", value: "ALL" },
              { label: "Completed", value: "COMPLETED" },
              { label: "Expired", value: "EXPIRED" },
              { label: "Trashed", value: "TRASHED" },
            ]}
            urlParameterName="status"
          />
        </div>
        <div>
          <DatePickerURL />
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <Suspense fallback={<DrugListSkeleton isLoading={true} />}>
          <CompletedStockPageTable
            query={query}
            currentPage={currentPage}
            selection={selection}
            sort={sort}
            status={status}
            fromDate={fromDate}
            toDate={toDate}
          />
        </Suspense>
      </div>

    </div>
  );
}
