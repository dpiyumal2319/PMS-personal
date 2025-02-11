import React from 'react';
import { getFilteredDrugsByModel } from '@/app/lib/actions';
import DrugListByModel from '@/app/(dashboard)/inventory/available-stocks/_components/DrugListByModel';

async function Page({ params }: {
    params: Promise<{ drugId: string, query: string, currentPage: number, selection: string, sort: string }>
}) {

    const { drugId, query, currentPage, selection, sort } = await params;
    const filteredDrugsByModel = await getFilteredDrugsByModel(query, currentPage, sort, Number(drugId));


    return (
        <div>
            <DrugListByModel drugs={filteredDrugsByModel} />
        </div>
    );
}

export default Page;


