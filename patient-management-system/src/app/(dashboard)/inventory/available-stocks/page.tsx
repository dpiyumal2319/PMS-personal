import React, { Suspense } from "react";
import Loading from "@/app/(dashboard)/Loading";

import { DrugForm } from "@/app/(dashboard)/inventory/_components/DrugForm";
import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";

import SortingDropdown from "@/app/(dashboard)/inventory/_components/SortingDropdown";

export default async function InventoryAvailable({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    selection?: string;
    sort?: string;
  }>;
  children: React.ReactNode;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const currentPage = params?.page || "1";
  const selection = params?.selection || "model";

  return (
    <div className="flex h-screen flex-col w-full">
      <div className="sticky top-0">
        <div className="p-4 bg-white border-b shadow-md">
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
              <DrugForm />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <Suspense fallback={<Loading />}>
          {" "}
          <h1 className="text-4xl font-bold text-primary-700 font-montserrat mb-8">
            Available Stocks
          </h1>
        </Suspense>
      </div>
    </div>
  );
}
