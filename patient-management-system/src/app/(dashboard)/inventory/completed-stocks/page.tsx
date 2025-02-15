import React, {Suspense} from "react";
import Loading from "@/app/(dashboard)/Loading";

import SearchPanel from "@/app/(dashboard)/_components/Search";
import Dropdown from "@/app/(dashboard)/_components/Dropdown";

import SortingDropdown from "@/app/(dashboard)/inventory/_components/SortingDropdown";
import DatePicker from "@/app/(dashboard)/_components/DatePicker";

export default async function InventoryCompleted({searchParams}: {
    searchParams?: Promise<{ query?: string; page?: string; selection?: string; sort?: string; }>
}) {
    const params = await searchParams;
    const selection = params?.selection || "model";


    return (
        <div className="flex h-screen flex-col w-full">
            <div className="sticky top-0">
                <div className="p-4 bg-white border-b shadow-md">
                    <div className="flex flex-wrap gap-4">
                        <Dropdown
                            items={[
                                {label: "By Model", value: "model"},
                                {label: "By Brand", value: "brand"},
                                {label: "By Batch", value: "batch"},
                            ]}
                            urlParameterName="selection"
                        />
                        <div className="relative w-[200px]">
                            <SearchPanel placeholder="Search by Name"/>
                        </div>
                        <SortingDropdown selection={selection}/>
                        <div>
                            <DatePicker/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-auto">
                <Suspense fallback={<Loading/>}>
                    {" "}
                    <h1 className="text-4xl font-bold text-primary-700 font-montserrat mb-8">
                        Completed Stocks
                    </h1>
                </Suspense>
            </div>
        </div>
    );
}
