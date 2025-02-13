// import React, { Suspense } from "react";
// import Loading from "@/app/(dashboard)/Loading";

// import SearchPanel from "@/app/(dashboard)/_components/Search";
// import Dropdown from "@/app/(dashboard)/_components/Dropdown";

// import SortingDropdown from "@/app/(dashboard)/inventory/_components/SortingDropdown";
// import DatePicker from "@/app/(dashboard)/_components/DatePicker";

// export default async function InventoryCompleted() {

//   return (
//     <div className="flex h-screen flex-col w-full">
//       <div className="sticky top-0">
//         <div className="p-4 bg-white border-b shadow-md">
//           <div className="flex flex-wrap gap-4">
//             <Dropdown
//               items={[
//                 { label: "By Model", value: "model" },
//                 { label: "By Brand", value: "brand" },
//                 { label: "By Batch", value: "batch" },
//               ]}
//               urlParameterName="selection"
//             />
//             <div className="relative w-[200px]">
//               <SearchPanel placeholder="Search by Name" />
//             </div>
//             <SortingDropdown selection="selection" />
//             <div>
//               <DatePicker />
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="flex-grow overflow-auto">
//         <Suspense fallback={<Loading />}>
//           {" "}
//           <h1 className="text-4xl font-bold text-primary-700 font-montserrat mb-8">
//             Completed Stocks
//           </h1>
//         </Suspense>
//       </div>
//     </div>
//   );
// }


import React, { Suspense } from "react";

import { DrugForm } from "@/app/(dashboard)/inventory/_components/DrugForm";
import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";

import SortingDropdown from "@/app/(dashboard)/inventory/_components/SortingDropdown";
import CompletedStockPageTable from "@/app/(dashboard)/inventory/completed-stocks/_components/CompletedStockPageTable";
import DrugListSkeleton from "@/app/(dashboard)/inventory/available-stocks/_components/DrugListSkeleton";

export default async function InventoryAvailable({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    selection?: string;
    sort?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || "";
  const currentPage = Number(params?.page) || 1;
  const selection = params?.selection || "model";
  const sort = params?.sort || "alphabetically";
  const status = params?.status || "ALL";

  return (
    <div className="flex h-full flex-col w-full">
      <div className="sticky top-0 p-4 bg-white border-b shadow-md flex gap-4 z-20">
        <div className="relative w-[200px]">
          <SearchPanel placeholder="Search by Name" />
        </div>
        <Dropdown
          items={[
            { label: "By Model", value: "model" },
            { label: "By Brand", value: "brand" },
            { label: "By Batch", value: "batch" },
          ]}
          urlParameterName="selection"
        />

        <SortingDropdown selection="selection" />
        <div>
          <Dropdown
            items={[
              { label: "All", value: "all" },
              { label: "Completed", value: "completed" },
              { label: "Expired", value: "expired" },
              { label: "Trashed", value: "trashed" },
            ]}
            urlParameterName="status"
          />
        </div>
        <div>
          <DrugForm />
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <Suspense fallback={<DrugListSkeleton isLoading={true} />}>
          <CompletedStockPageTable
            query={query}
            currentPage={currentPage}
            selection={selection}
            sort={sort}
          />
        </Suspense>
      </div>

    </div>
  );
}
