import React from "react";
import {getDrugModelsWithBufferLevel} from "@/app/lib/actions";
import {DrugModelCard} from "@/app/(dashboard)/inventory/_components/DrugModelCard";
import BufferTopBar from "@/app/(dashboard)/inventory/_components/BufferTopBar";

export default async function BufferLevelPage({
                                                  searchParams,
                                              }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Extract query parameters
    const awaitedSearchParams = await searchParams;

    const query =
        typeof awaitedSearchParams.query === "string" ? awaitedSearchParams.query : undefined;
    const selection =
        typeof awaitedSearchParams.selection === "string"
            ? awaitedSearchParams.selection
            : "buffered";

    // Get drugs with filtering and sorting
    const drugs = await getDrugModelsWithBufferLevel(query, selection);

    return (
        <div className="flex flex-col overflow-hidden h-full">
            <BufferTopBar/>
            <div className="flex flex-col flex-1 h-full p-4 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-6 text-primary-700">
                    Drug Buffer Levels
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drugs.map((drug) => (
                        <DrugModelCard key={drug.id} drug={drug}/>
                    ))}
                </div>
            </div>
        </div>
    );
}
