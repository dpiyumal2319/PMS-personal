import React from 'react'
import { getFilteredDrugsByModel, getFilteredDrugsByBrand, getFilteredDrugsByBatch } from '@/app/lib/actions'
import DrugListByModel from './DrugListByModel'
import DrugListByBrand from './DrugListByBrand'
import DrugListByBatch from './DrugListByBatch'

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
    let content = null;

    if (selection === "brand") {
        const filteredDrugsByBrand = await getFilteredDrugsByBrand(query, currentPage, sort, 0);
        content = <DrugListByBrand brands={filteredDrugsByBrand} />;
    } else if (selection === "model") {
        const filteredDrugsByModel = await getFilteredDrugsByModel(query, currentPage, sort, 0);
        content = <DrugListByModel drugs={filteredDrugsByModel} />;
    } else if (selection === "batch") {
        const filteredDrugsByBatch = await getFilteredDrugsByBatch(query, currentPage, sort);
        content = <DrugListByBatch batches={filteredDrugsByBatch} />;
    }

    return <div>{content}</div>;
}
