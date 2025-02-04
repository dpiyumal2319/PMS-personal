import { Suspense } from "react";
import SearchBox from "../_components/Search";
import PatientTable from "./_components/PatientTable";
import { getTotalPages } from "@/app/lib/actions";
import Pagination from "../_components/Pagination";
import { PatientsTableSkeleton } from "./_components/PatientsTableSkeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import SearchDropdown from "../_components/Dropdown";

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
  const filter = params?.filter || "name";
  const totalPages = await getTotalPages(query);

  return (
    <>
      <div className="w-full p-4 flex flex-col bg-amber-400 h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">All Patients</h1>
          <Button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
            + Add Patient
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 mb-6">
          <SearchBox placeholder="Search patients..." />
          <SearchDropdown
            items={[
              { label: "Name", value: "name" },
              { label: "NIC", value: "NIC" },
              { label: "Telephone", value: "telephone" },
            ]}
            urlParameterName="filter"
          />
        </div>

        {/* Table */}
        <div className="bg-slate-600 flex-grow overflow-y-auto">
          <Suspense key={query + currentPage} fallback={<PatientsTableSkeleton />}>
            <PatientTable query={query} currentPage={currentPage} filter={filter} />
          </Suspense>
        </div>
      </div>
      {/* Pagination */}
      <div className="mt-auto flex justify-center py-4 bg-pink-600 sticky bottom-0">
        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}
