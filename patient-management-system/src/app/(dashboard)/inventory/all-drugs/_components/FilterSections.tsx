// components/drugs/filter-section.tsx
"use client"

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterSectionProps {
  id: string;
  title: string;
  items: string[];
}

export function FilterSection({ id, title, items }: FilterSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current selected items from URL parameters
  const getCurrentSelectedItems = useCallback(() => {
    const paramValue = searchParams.get(id);
    return paramValue ? paramValue.split(',') : [];
  }, [searchParams, id]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>(getCurrentSelectedItems());
  const allChecked = selectedItems.length === items.length;
  
  const filteredItems = items.filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateUrlParams = useCallback((newSelectedItems: string[]) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (newSelectedItems.length > 0) {
      current.set(id, newSelectedItems.join(','));
    } else {
      current.delete(id);
    }
    
    const search = current.toString();
    const query = search ? `?${search}` : "";
    
    router.push(`${window.location.pathname}${query}`, { scroll: false });
  }, [router, searchParams, id]);

  const handleSelectAll = () => {
    const newSelectedItems = allChecked ? [] : [...items];
    setSelectedItems(newSelectedItems);
    updateUrlParams(newSelectedItems);
  };

  const handleItemChange = (item: string) => {
    const newSelectedItems = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    
    setSelectedItems(newSelectedItems);
    updateUrlParams(newSelectedItems);
  };

  return (
    <AccordionItem value={id}>
      <AccordionTrigger className="hover:no-underline">
        <span className="text-sm font-medium">{title}</span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`select-all-${id}`} 
              checked={allChecked}
              onCheckedChange={handleSelectAll}
            />
            <Label 
              htmlFor={`select-all-${id}`}
              className="text-sm cursor-pointer"
            >
              Select All
            </Label>
          </div>
          
          <Input
            placeholder={`Search ${title.toLowerCase()}`}
            className="h-8 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {filteredItems.map(item => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${id}-${item}`}
                  checked={selectedItems.includes(item)}
                  onCheckedChange={() => handleItemChange(item)}
                />
                <Label 
                  htmlFor={`${id}-${item}`}
                  className="text-sm cursor-pointer"
                >
                  {item}
                </Label>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <p className="text-sm text-gray-500 italic">No matches found</p>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}