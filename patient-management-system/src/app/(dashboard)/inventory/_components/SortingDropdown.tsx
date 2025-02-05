"use client";

import React from "react";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";
import { useSearchParams } from "next/navigation";
import { searchModels } from "@/app/lib/definitions";

function SortingDropdown({ selection }: { selection: string }) {
  const searchParams = useSearchParams();
  const selected = searchParams.get(selection);
  const selectedSort = searchModels.filter(
    (search) => search.value === selected
  );

  console.log(selectedSort);
  console.log(selectedSort[0]?.sortOptions);

  return (
    <div>
      <Dropdown items={selectedSort[0]?.sortOptions} urlParameterName="sort" />
    </div>
  );
}

export default SortingDropdown;
