"use client";

import React from "react";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";

import { searchModelsCM } from "@/app/lib/definitions";

function SortingDropdownCM({ selection }: { selection: string }) {
  // const searchParams = useSearchParams();
  // const selected = searchParams.get(selection);

  const selectedSort = searchModelsCM.filter(
    (search) => search.value === selection
  );

  return (
    <div>
      <Dropdown items={selectedSort[0]?.sortOptions} urlParameterName="sort" />
    </div>
  );
}

export default SortingDropdownCM;
