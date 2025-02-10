import React from 'react';
import { getFilteredDrugsByModel } from '@/app/lib/actions';
import DrugListByModel from '@/app/(dashboard)/inventory/available-stocks/_components/DrugListByModel';

async function Page({ params }: {
    params: Promise<{ id: string, query: string, currentPage: number, selection: string, sort: string }>
}) {

    const { id, query, currentPage, selection, sort } = await params;
    const filteredDrugsByModel = await getFilteredDrugsByModel(query, currentPage, sort, Number(id));


    return (
        <div>
            <DrugListByModel drugs={filteredDrugsByModel} />
        </div>
    );
}

export default Page;


