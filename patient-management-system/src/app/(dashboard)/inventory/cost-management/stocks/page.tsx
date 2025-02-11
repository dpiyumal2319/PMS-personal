import React from "react";
import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";
import SortingDropdown from "@/app/(dashboard)/inventory/_components/SortingDropdown";
import DatePicker from "@/app/(dashboard)/_components/DatePicker";
import { getAvailableDrugsTotalPages } from "@/app/lib/actions";

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
  const params = await searchParams;
  const query = params?.query || "";
  // const currentPage = Number(params?.page) || 1;
  const selection = params?.selection || "model";
  const sort = params?.sort || "alphabetically";
  // const totalPages = await getAvailableDrugsTotalPages(query, selection);

  return (
    <div className="flex flex-wrap gap-4">
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
        <DatePicker />
      </div>
    </div>
  );
}
