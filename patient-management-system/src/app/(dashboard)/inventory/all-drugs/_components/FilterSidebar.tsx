"use client"

import { cn } from "@/lib/utils";
import { FilterSection, FilterSectionOnlyName, FilterSectionRef } from "./FilterSections";
import {
  Accordion
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// Import the fetching functions
import {
  fetchDrugTypes,
  fetchDrugModels,
  fetchDrugBrands,
  fetchSuppliers,
  fetchBatchStatuses
} from "../lib/dataFetch";

interface FilterSidebarProps {
  className?: string;
}

export function FilterSidebar({ className }: FilterSidebarProps) {
  const router = useRouter();

  // State to store filter options
  const [drugType, setdrugType] = useState<string[]>([]);
  const [drugModel, setDrugModel] = useState<{
    id: number;
    name: string;
  }[]>([]);
  const [drugBrands, setDrugBrands] = useState<{ name: string, id: number }[]>([]);
  const [suppliers, setSuppliers] = useState<{ name: string, id: number }[]>([]);
  const [batchStatuses, setBatchStatuses] = useState<string[]>([]);

  // State to manage loading and error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // Fetch filter options on component mount
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        setIsLoading(true);
        const [
          fetcheddrugType,
          fetchedDrugModels,
          fetchedDrugBrands,
          fetchedSuppliers,
          fetchedBatchStatuses
        ] = await Promise.all([
          fetchDrugTypes(),
          fetchDrugModels(),
          fetchDrugBrands(),
          fetchSuppliers(),
          fetchBatchStatuses()
        ]);

        setdrugType(fetcheddrugType);
        setDrugModel(fetchedDrugModels);
        setDrugBrands(fetchedDrugBrands);
        setSuppliers(fetchedSuppliers);
        setBatchStatuses(fetchedBatchStatuses);
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
        setError("Failed to load filter options");
      } finally {
        setIsLoading(false);
      }
    }

    loadFilterOptions();
  }, []);

  const filterRefs = useRef<(FilterSectionRef | null)[]>([]);

  const handleResetFilters = () => {
    setResetting(true);
    filterRefs.current.forEach(ref => ref?.reset());
    router.push(window.location.pathname, { scroll: false });
    setResetting(false);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={cn("border rounded-lg flex items-center justify-center", className)}>
        <p>Loading filters...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={cn("border rounded-lg flex items-center justify-center", className)}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg", className)}>
      <div className="p-4 border-b">
        <h3 className="font-medium text-lg">Filters</h3>
        <p className="text-sm text-gray-500">Refine your inventory view</p>
      </div>

      <ScrollArea className="h-[calc(100vh-13rem)]">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["drugModel"]}>


            <FilterSection
              ref={el => { filterRefs.current[2] = el; }}

              id="drugModel"
              title="Drug Model"
              items={drugModel}
            />

            <FilterSection
              ref={el => { filterRefs.current[3] = el; }}

              id="drugBrand"
              title="Drug Brand"
              items={drugBrands}
            />

            <FilterSection
              ref={el => { filterRefs.current[4] = el; }}

              id="supplier"
              title="Supplier"
              items={suppliers}
            />

            <FilterSectionOnlyName
              ref={el => { filterRefs.current[0] = el; }}
              id="drugType"
              title="Drug Type"
              items={drugType}
            />

            <FilterSectionOnlyName
              ref={el => { filterRefs.current[1] = el; }}
              id="batchStatus"
              title="Batch Status"
              items={batchStatuses}
            />
          </Accordion>

          <div className="mt-8 space-y-3">
            <Button className="w-full">Apply Filters</Button>
            <Button
              variant="outline"
              className={`w-full ${resetting ? 'opacity-50 pointer-events-none' : ''}`}
              size="sm"
              onClick={handleResetFilters}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2  ${resetting ? 'animate-spin' : ''}`} />
              Reset Filters
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}