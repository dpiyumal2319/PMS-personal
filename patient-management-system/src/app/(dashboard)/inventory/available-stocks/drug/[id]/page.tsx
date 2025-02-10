import React from 'react';
import { getFilteredDrugsByBrand, getFilteredDrugsByModel } from '@/app/lib/actions';
import DrugListByBrand from '@/app/(dashboard)/inventory/available-stocks/_components/DrugListByBrand';

async function Page({ params }: {
    params: Promise<{ id: string, query: string, currentPage: number, selection: string, sort: string }>
}) {

    const { id, query, currentPage, selection, sort } = await params;
    const filteredDrugsByBrand = await getFilteredDrugsByBrand(query, currentPage, sort, Number(id));


    return (
        <div>
            <DrugListByBrand brands={filteredDrugsByBrand} />
        </div>
    );
}

export default Page;


