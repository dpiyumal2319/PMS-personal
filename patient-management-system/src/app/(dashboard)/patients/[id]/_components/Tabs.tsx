"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, FileText, FilePen, ClipboardEdit } from "lucide-react";

const PatientTabs = ({ patientId }: { patientId: number }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Extract the tab name from the URL, or default to "prescribe" if on /patients/:id
  const pathParts = pathname.split("/");
  const currentTab = pathParts.length > 3 ? pathParts[3] : "prescribe";

  const handleTabChange = (value: string) => {
    if (value === currentTab) return;
    if (value === "prescribe") return router.push(`/patients/${patientId}`);
    router.push(`/patients/${patientId}/${value}`);
  };

  return (
    <div className="mt-6 border-t pt-4">
      <Tabs
        defaultValue={currentTab}
        onValueChange={handleTabChange}
        className="w-full h-12"
      >
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="prescribe" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Prescribe
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FilePen className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <ClipboardEdit className="h-4 w-4" />
            Edit
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default PatientTabs;
