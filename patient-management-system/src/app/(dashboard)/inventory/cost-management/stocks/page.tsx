import React from "react";
import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";
import SortingDropdown from "@/app/(dashboard)/inventory/_components/SortingDropdown";
import DatePicker from "@/app/(dashboard)/_components/DatePicker";

export default function StockPage() {
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
