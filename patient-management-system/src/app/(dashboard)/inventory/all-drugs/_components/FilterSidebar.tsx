// components/drugs/filter-sidebar.tsx
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

interface FilterSidebarProps {
  className?: string;
}

export function FilterSidebar({ className }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // This would be populated from your API
  const drugModels = ["Tablet", "Syrup", "Injection", "Capsule", "Cream"];
  const drugBrands = ["Pfizer", "Novartis", "Roche", "Sanofi", "GSK", "Johnson & Johnson"];
  const suppliers = ["Supplier A", "Supplier B", "Supplier C", "Distributor X", "Wholesaler Y"];
  const batchStatuses = ["Available", "Completed", "Expired", "Disposed", "Quality Failed"];
  
  const handleResetFilters = () => {
    router.push(window.location.pathname, { scroll: false });
  };

  return (
    <div className={cn("border rounded-lg", className)}>
      <div className="p-4 border-b">
        <h3 className="font-medium text-lg">Filters</h3>
        <p className="text-sm text-gray-500">Refine your inventory view</p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-13rem)]">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["drugModel", "batchStatus"]}>
            <FilterSection 
              id="drugModel"
              title="Drug Model"
              items={drugModels}
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