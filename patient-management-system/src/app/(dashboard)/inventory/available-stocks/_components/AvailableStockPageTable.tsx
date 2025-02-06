import React from 'react'
import { getFilteredDrugsByModel } from '@/app/lib/actions'

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

    console.log(filteredDrugs)
    

    return (
        <h1>Hii</h1>
    )
}

