"use client";
import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";

import SortingDropdown from "@/app/(dashboard)/inventory/_components/SortingDropdown";
import DatePicker from "@/app/(dashboard)/_components/DatePicker";

export default function TabsBar() {
  //  const router = useRouter();
  //  const pathname = usePathname();

  //  // Extract the tab name from the URL, or default to "prescribe" if on /patients/:id
  //  const pathParts = pathname.split("/");
  //  const currentTab = pathParts.length > 3 ? pathParts[3] : "prescribe";

  //  const handleTabChange = (value: string) => {
  //    if (value === currentTab) return;
  //    if (value === "prescribe") return router.push(`/patients/${patientId}`);
  //    router.push(`/patients/${patientId}/${value}`);
  //  };
  return (
    <Tabs defaultValue="stock" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="stock">Stock</TabsTrigger>
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
      </TabsList>
      <TabsContent value="stock">
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
      </TabsContent>
      <TabsContent value="analysis">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold  text-primary-700 font-montserrat">
            Select the duration
          </h3>

          <DatePicker />
        </div>
      </TabsContent>
    </Tabs>
  );
}
