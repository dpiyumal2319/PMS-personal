"use client"

import { cn } from "@/lib/utils";
import { FilterSection, FilterSectionOnlyName, FilterSectionRef } from "./FilterSections";
import {
  Accordion
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Check } from "lucide-react";
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

  // State to manage loading, error, and button states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
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

  const handleApplyFilters = async () => {
    setApplying(true);
    
    try {
      // Collect all selected filters from refs
      const filterParams = new URLSearchParams();

      filterRefs.current.forEach(ref => {
        if (ref?.getSelectedItems) {
          const { id, selectedItems } = ref.getSelectedItems();
          if (selectedItems.length > 0) {
            filterParams.set(id, selectedItems.join(','));
          }
        }
      });

      const search = filterParams.toString();
      const query = search ? `?${search}` : "";

      await router.push(`${window.location.pathname}${query}`, { scroll: false });
      
      // Keep the "Applied" state visible briefly for user feedback
      setTimeout(() => {
        setApplying(false);
      }, 1000);
    } catch (error) {
      console.error("Error applying filters:", error);
      setApplying(false);
    }
  };

  const handleResetFilters = async () => {
    setResetting(true);
    
    try {
      filterRefs.current.forEach(ref => ref?.reset());

      // Clear URL params
      await router.push(window.location.pathname, { scroll: false });
      
      // Keep the resetting state visible briefly for user feedback
      setTimeout(() => {
        setResetting(false);
      }, 800);
    } catch (error) {
      console.error("Error resetting filters:", error);
      setResetting(false);
    }
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
              applyOnClick={false}
            />

            <FilterSection
              ref={el => { filterRefs.current[3] = el; }}
              id="drugBrand"
              title="Drug Brand"
              items={drugBrands}
              applyOnClick={false}
            />

            <FilterSection
              ref={el => { filterRefs.current[4] = el; }}
              id="supplier"
              title="Supplier"
              items={suppliers}
              applyOnClick={false}
            />

            <FilterSectionOnlyName
              ref={el => { filterRefs.current[0] = el; }}
              id="drugType"
              title="Drug Type"
              items={drugType}
              applyOnClick={false}
            />

            <FilterSectionOnlyName
              ref={el => { filterRefs.current[1] = el; }}
              id="batchStatus"
              title="Batch Status"
              items={batchStatuses}
              applyOnClick={false}
            />
          </Accordion>

          <div className="mt-8 space-y-3">
            <Button
              className="w-full relative"
              onClick={handleApplyFilters}
              disabled={applying}
            >
              <span className={`transition-opacity ${applying ? 'opacity-0' : 'opacity-100'}`}>
                Apply Filters
              </span>
              {applying && (
                <span className="absolute inset-0 flex items-center justify-center">
                  {applying === true ? (
                    <div className="flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Applied!
                    </div>
                  )}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full relative"
              size="sm"
              onClick={handleResetFilters}
              disabled={resetting}
            >
              <span className={`flex items-center transition-opacity ${resetting ? 'opacity-0' : 'opacity-100'}`}>
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Reset Filters
              </span>
              {resetting && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Resetting...
                </span>
              )}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}