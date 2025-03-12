import React from "react";
import { getDrugModelsWithBufferLevel } from "@/app/lib/actions";
import { DrugModelCard } from "@/app/(dashboard)/inventory/_components/DrugModelCard";

export default async function BufferLevelPage() {
  const drugs = await getDrugModelsWithBufferLevel();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-primary-500">
        Drug Buffer Levels
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drugs.map((drug) => (
          <DrugModelCard key={drug.id} drug={drug} />
        ))}
      </div>
    </div>
  );
}
