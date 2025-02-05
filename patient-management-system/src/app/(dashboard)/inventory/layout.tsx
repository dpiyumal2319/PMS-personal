"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import React, { Suspense, useState } from "react";
import Loading from "@/app/(dashboard)/Loading";
import { AddItemButton } from "../_components/AddButton";
import DatePicker from "../_components/DatePicker";
import { DrugForm } from "../_components/DrugForm";
import SearchPanel from "../_components/Search";

import { usePathname } from "next/navigation";

const searchModels = {
  brand: {
    label: "By Brand",
    sortOptions: [
      { label: "Alphabetically", value: "alphabetically" },
      { label: "Lowest", value: "lowest" },
      { label: "Highest", value: "higest" },
    ],
  },
  model: {
    label: "By Model",
    sortOptions: [
      { label: "Alphabetically", value: "alphabetically" },
      { label: "Lowest", value: "lowest" },
      { label: "Highest", value: "higest" },
    ],
  },
  batch: {
    label: "By Batch",
    sortOptions: [
      { label: "Expiry Date", value: "expiryDate" },
      { label: "Newly Added", value: "newlyAdded" },
      { label: "Alphabetically", value: "alphabetically" },
    ],
  },
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();
  const [selectedSearchModel, setSelectedSearchModel] = useState<string>("");
  const [selectedSort, setselectedSort] = useState<string>("");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col w-full">
      {/* Inventory Search Controls */}
      <div className="sticky top-0">
        <div className="p-4 bg-white border-b shadow-md">
          <div className="flex flex-wrap gap-4">
            {/* Model Select */}
            <Select
              value={selectedSearchModel}
              onValueChange={setSelectedSearchModel}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(searchModels).map(([key, model]) => (
                  <SelectItem key={key} value={key}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative w-[200px]">
              <SearchPanel placeholder="Search by Name" />
            </div>
            {/* Dynamic Sort By Select */}
            <Select
              value={selectedSort}
              onValueChange={(value) => setselectedSort(value)}
              disabled={!selectedSearchModel}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {selectedSearchModel &&
                  searchModels[
                    selectedSearchModel as keyof typeof searchModels
                  ].sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {/* Time Period */}

            {(pathName.startsWith("/inventory/cost-management") ||
              pathName.startsWith("/inventory/completed-stocks")) && (
              <DatePicker />
            )}
            {/* Add New Item Button */}
            {pathName.startsWith("/inventory/available-stocks") && (
              <div>
                <div>
                  <DrugForm setOpen={setOpen} />{" "}
                  {/* Pass setOpen to close on form submission */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </div>
    </div>
  );
}
