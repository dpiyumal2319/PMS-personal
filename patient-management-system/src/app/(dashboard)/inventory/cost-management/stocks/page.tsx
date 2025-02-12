import { Suspense } from "react";
import { getAvailableDrugsTotalPages } from "@/app/lib/actions";
import { SortOption } from "@/app/lib/definitions";
import Pagination from "@/app/(dashboard)/_components/Pagination";
import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";
import SortingDropdownCM from "@/app/(dashboard)/inventory/cost-management/_components/SortingDropdownCM";
import PriceTable from "@/app/(dashboard)/inventory/cost-management/_components/PriceTable";

export default async function StockPage({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    selection?: string;
    sort?: string;
  }>;
}) {
    const searchParamsResolved = await searchParams;

  const query = searchParamsResolved?.query || "";
  const currentPage = Number(searchParamsResolved?.page) || 1;
  const selection = searchParamsResolved?.selection || "model";
  // type SortOption is now imported from "@/app/lib/actions"
  const sort: SortOption =
    (searchParamsResolved?.sort as SortOption) || "alphabetically";

  const totalPages = await getAvailableDrugsTotalPages(query, selection);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Dropdown
          items={[
            { label: "By Model", value: "model" },
            { label: "By Brand", value: "brand" },
            { label: "By Batch", value: "batch" },
          ]}
          urlParameterName="selection"
          // defaultValue="model"
        />
        <div className="relative w-[200px]">
          <SearchPanel placeholder="Search by Name" />
        </div>
        <SortingDropdownCM selection={selection} />
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto mt-4">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <PriceTable
            query={query}
            currentPage={currentPage}
            selection={selection}
            sort={sort}
          />
        </Suspense>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="mt-4 flex justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
