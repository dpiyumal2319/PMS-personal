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
import { useRef, useState } from "react";

interface FilterSectionProps {
  id: string;
  title: string;
  items: string[];
}

export function FilterSection({ id, title, items }: FilterSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const allChecked = selectedItems.length === items.length;
  
  const filteredItems = items.filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    if (allChecked) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...items]);
    }
  };

  const handleItemChange = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
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