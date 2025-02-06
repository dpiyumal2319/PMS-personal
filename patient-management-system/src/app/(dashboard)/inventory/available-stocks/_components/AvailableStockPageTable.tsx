import React from 'react'
import { getFilteredDrugsByModel } from '@/app/lib/actions'
import DrugListByModel from './DrugListByModel';
import { getFilteredDrugsByBrand } from '@/app/lib/actions';
import DrugListByBrand from './DrugListByBrand';
import { getFilteredDrugsByBatch } from '@/app/lib/actions';
import DrugListByBatch from './DrugListByBatch';

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
    const filteredDrugsByBrand = await getFilteredDrugsByBrand(query, currentPage, sort);
    const filteredDrugsByModel = await getFilteredDrugsByModel(query, currentPage, sort);
    const filteredDrugsByBatch = await getFilteredDrugsByBatch(query, currentPage, sort);
    console.log(filteredDrugsByBatch)


    return (
        // <div >
        //     <DrugListByModel drugs={filteredDrugsByModel} />
        // </div>
        // <div >
        //     <DrugListByBrand brands={filteredDrugsByBrand} />
        // </div>
        <div >
            <DrugListByBatch batches={filteredDrugsByBatch} />
        </div>


    )
}

