// page.tsx
import { Suspense } from "react";
import SearchBox from "../_components/Search";
import PatientTable from "./_components/PatientTable";
import { getTotalPages } from "@/app/lib/actions";
import Pagination from "./_components/Pagination";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  // Await the searchParams
  const params = await searchParams;
  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;
  const totalPages = await getTotalPages(query);


  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={` text-2xl`}>Patients</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <SearchBox placeholder="Search patients..." />
      </div>
      <Suspense key={query + currentPage} fallback={<div>Loading...</div>}>
        <PatientTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}