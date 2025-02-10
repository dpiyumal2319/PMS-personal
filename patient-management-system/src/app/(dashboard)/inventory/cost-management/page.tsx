import React, { Suspense } from "react";
import Loading from "@/app/(dashboard)/Loading";

import TabsBar from "./_components/TabBar";

export default async function InventoryCost() {
  return (
    <div className="flex h-screen flex-col w-full">
      <div className="sticky top-0">
        <div className="p-4 bg-white border-b shadow-md">
          <div>
            <TabsBar />
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <Suspense fallback={<Loading />}>
          {" "}
          <h1 className="text-4xl font-bold text-primary-700 font-montserrat mb-8">
            Cost Management
          </h1>
        </Suspense>
      </div>
    </div>
  );
}
