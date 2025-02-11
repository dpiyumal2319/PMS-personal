import React from 'react'
import { getFilteredDrugsByModel, getFilteredDrugsByBrand, getFilteredDrugsByBatch } from '@/app/lib/actions'
import DrugListByModel from './DrugListByModel'
import DrugListByBrand from './DrugListByBrand'
import DrugListByBatch from './DrugListByBatch'
import { getAvailableDrugsTotalPages } from '@/app/lib/actions'
import Pagination from '@/app/(dashboard)/_components/Pagination'

export default async function AvailableStockPageTable({
    query,
    currentPage,
    selection,
    sort,
}: {
    query: string;
    currentPage: number;
    selection: string;
    sort: string;
}) {

    const totalPages = await getAvailableDrugsTotalPages(query, selection);

    let content = null;

    if (selection === "brand") {
        const filteredDrugsByBrand = await getFilteredDrugsByBrand({
            query,
            page: currentPage,
            sort,
            modelId: 0
        });
                content = <div className="flex h-full flex-col w-full">
            <div >
                <DrugListByBrand brands={filteredDrugsByBrand} />
            </div>
            <div className="mt-auto flex justify-center py-4 sticky bottom-0">
                <Pagination totalPages={totalPages} itemsPerPage={10} />
            </div>
        </div>;
    } else if (selection === "model") {
        const filteredDrugsByModel = await getFilteredDrugsByModel({
            query,
            page: currentPage,
            sort,
            brandId: 0
        });
        
        content = <div >
            <div>
                <DrugListByModel drugs={filteredDrugsByModel} />
            </div>
            <div className="mt-auto flex justify-center py-4 sticky bottom-0">
                <Pagination totalPages={totalPages} itemsPerPage={10} />
            </div>
        </div>;
    } else if (selection === "batch") {
        const filteredDrugsByBatch = await getFilteredDrugsByBatch(query, currentPage, sort, 0, 0);
        content = <div>
            <div>
                <DrugListByBatch batches={filteredDrugsByBatch} />
            </div>
            <div className="mt-auto flex justify-center py-4 sticky bottom-0">
                <Pagination totalPages={totalPages} itemsPerPage={10} />
            </div>
        </div>;
    }

    return <div>{content}</div>;
}
