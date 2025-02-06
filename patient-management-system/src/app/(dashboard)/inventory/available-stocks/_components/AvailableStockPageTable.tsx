import React from 'react'
import { getFilteredDrugsByModel } from '@/app/lib/actions'
import DrugListByModel from './DrugListByModel';

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
    const filteredDrugs = await getFilteredDrugsByModel(query, currentPage, sort);

    return (
        <div >
            <DrugListByModel drugs={filteredDrugs} />
        </div>
    )
}

