"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { SortOption, DateRange } from "@/app/lib/definitions";
import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";
import SortingDropdownCM from "@/app/(dashboard)/inventory/cost-management/_components/SortingDropdownCM";
import DatePicker from "@/app/(dashboard)/inventory/cost-management/_components/DatePickerCM";

interface StockTopbarProps {
  defaultStartDate?: Date;
  defaultEndDate?: Date;
  defaultSelection?: string;
}

export default function StockTopbar({
  defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  defaultEndDate = new Date(),
  defaultSelection = "model",
}: StockTopbarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Get current values from URL or use defaults
  const query = searchParams.get("query") || "";
  const selection = searchParams.get("selection") || defaultSelection;
  const sort = (searchParams.get("sort") as SortOption) || "alphabetically";

  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : defaultStartDate;

  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : defaultEndDate;

  const handleDateChange = (dateRange: DateRange) => {
    const params = new URLSearchParams(searchParams);
    params.set("startDate", dateRange.startDate.toISOString().split("T")[0]);
    params.set("endDate", dateRange.endDate.toISOString().split("T")[0]);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap gap-4 justify-center">
        <Dropdown
          items={[
            { label: "By Model", value: "model" },
            { label: "By Brand", value: "brand" },
            { label: "By Batch", value: "batch" },
          ]}
          urlParameterName="selection"
          //   defaultValue={selection}
        />
        <div className="relative w-[200px]">
          <SearchPanel
            placeholder="Search by Name"
            //   defaultValue={query}
          />
        </div>
        <SortingDropdownCM
          selection={selection}
          // defaultValue={sort}
        />
        <DatePicker
          startDate={startDate}
          endDate={endDate}
          action={handleDateChange}
        />
      </div>
    </div>
  );
}
