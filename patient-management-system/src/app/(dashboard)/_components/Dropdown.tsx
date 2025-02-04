"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";

export default function SearchDropdown({ items }: { items: { label: string; value: string }[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState(items[0].value);

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Select onValueChange={handleSelect} value={filter}>
      <SelectTrigger className="w-48 border border-gray-300 rounded-lg px-3 py-2">
        <SelectValue placeholder="Search by" />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
