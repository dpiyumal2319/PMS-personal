import { Suspense } from "react";
import { getAvailableDrugsTotalPages } from "@/app/lib/actions";
import { SortOption } from "@/app/lib/definitions";
import Pagination from "@/app/(dashboard)/_components/Pagination";
import PriceTable from "@/app/(dashboard)/inventory/cost-management/_components/PriceTable";
import { PriceTableSkeleton } from "../_components/PriceTableSkeleton";
import StockTopbar from "../_components/StockTopBar";

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
    selection?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  //Await for the search
  const resolvedSearchParams = await searchParams;

  const query = resolvedSearchParams?.query || "";
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const selection = resolvedSearchParams?.selection || "model";
  const sort: SortOption =
    (resolvedSearchParams?.sort as SortOption) || "alphabetically";

  // Default to last 30 days if no dates are provided
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const startDate = resolvedSearchParams?.startDate
    ? new Date(resolvedSearchParams.startDate)
    : defaultStartDate;
  const endDate = resolvedSearchParams?.endDate
    ? new Date(resolvedSearchParams.endDate)
    : new Date();

  const totalPages = await getAvailableDrugsTotalPages(query, selection);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Top Bar */}
      <div
        className={
          "h-14 bg-white flex items-center justify-between py-3 px-4 border-b border-primary-900/25 shadow sticky top-0 z-50"
        }
      >
        <StockTopbar
          defaultStartDate={startDate}
          defaultEndDate={endDate}
          defaultSelection={selection}
        />
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto mt-4">
        <Suspense
          fallback={
            <div className="text-center">
              <PriceTableSkeleton />
            </div>
          }
        >
          <PriceTable
            query={query}
            currentPage={currentPage}
            selection={selection}
            sort={sort}
            startDate={startDate}
            endDate={endDate}
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
