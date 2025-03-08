"use client"

import { cn } from "@/lib/utils";
import { FilterSection } from "./FilterSections";
import { 
  Accordion
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

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
  const searchParams = useSearchParams();

  // State to store filter options
  const [drugType, setdrugType] = useState<string[]>([]);
  const [drugModel, setDrugModel] = useState<string[]>([]);
  const [drugBrands, setDrugBrands] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [batchStatuses, setBatchStatuses] = useState<string[]>([]);

  // State to manage loading and error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  
  const handleResetFilters = () => {
    router.push(window.location.pathname, { scroll: false });
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
              id="drugModel"
              title="Drug Model"
              items={drugModel}
            />
            
            <FilterSection 
              id="drugBrand"
              title="Drug Brand"
              items={drugBrands}
            />
            
            <FilterSection 
              id="supplier"
              title="Supplier"
              items={suppliers}
            />
            
            <FilterSection 
              id="drugType"
              title="Drug Type"
              items={drugType}
            />
            
            <FilterSection 
              id="batchStatus"
              title="Batch Status"
              items={batchStatuses}
            />
          </Accordion>
          
          <div className="mt-8 space-y-3">
            <Button className="w-full">Apply Filters</Button>
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={handleResetFilters}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}