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
    <div className="w-full p-6 bg-white rounded-xl shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">All Patients</h1>
        <Button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
          + Add Patient
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <SearchBox placeholder="Search patients..." />
        <SearchDropdown
          items={[
            { label: "Name", value: "name" },
            { label: "NIC", value: "NIC" },
            { label: "Telephone", value: "telephone" },
          ]}
        />
      </div>

      {/* Table */}
      <Suspense key={query + currentPage} fallback={<PatientsTableSkeleton />}>
        <PatientTable query={query} currentPage={currentPage} filter={filter} />
      </Suspense>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
