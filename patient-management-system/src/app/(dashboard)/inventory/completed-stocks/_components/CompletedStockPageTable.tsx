import React from 'react'
import { getFilteredDrugsByModel, getFilteredDrugsByBrand, getCompletedFilteredDrugsByBatch, getTotalPagesForFilteredDrugsByBrand, getTotalPagesForFilteredDrugsByModel, getTotalPagesForCompletedFilteredDrugsByBatch } from '@/app/lib/actions'
import DrugListByModel from '@/app/(dashboard)/inventory/available-stocks/_components/DrugListByModel'
import DrugListByBrand from '@/app/(dashboard)/inventory/available-stocks/_components/DrugListByBrand'
import DrugListByBatch from '@/app/(dashboard)/inventory/available-stocks/_components/DrugListByBatch'
import Pagination from '@/app/(dashboard)/_components/Pagination'

export default async function CompletedStockPageTable({
    query,
    currentPage,
    selection,
    sort,
    drugId,
    brandId,
    status,
    fromDate,
    toDate
}: {
    query: string;
    currentPage: number;
    selection: string;
    sort: string;
    drugId?: number;
    brandId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
}) 

{


    let content = null;


    if (selection === "brand") {
        const totalPages = await getTotalPagesForFilteredDrugsByBrand({
            query,
            modelId: 0
        });
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
                <Pagination totalPages={totalPages} itemsPerPage={9} />
            </div>
        </div>;
    } else if (selection === "model") {
        const totalPages = await getTotalPagesForFilteredDrugsByModel({
            query,
            brandId: 0
        });
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
                <Pagination totalPages={totalPages} itemsPerPage={9} />
            </div>
        </div>;
    } else if (selection === "batch") {
        const totalPages = await getTotalPagesForCompletedFilteredDrugsByBatch({
            query,
            modelId: drugId,
            brandId: brandId,
            fromDate,
            toDate,
            status

        });

        const filteredDrugsByBatch = await getCompletedFilteredDrugsByBatch({
            query,
            page: currentPage,
            sort,
            modelId: drugId,
            brandId: brandId,
            fromDate,
            toDate,
            status
        });


        content = <div>
            <div>
                <DrugListByBatch batches={filteredDrugsByBatch} />
            </div>
            <div className="mt-auto flex justify-center py-4 sticky bottom-0">
                <Pagination totalPages={totalPages} itemsPerPage={6} />
            </div>
        </div>;
    }

    return <div>{content}</div>;
}
