import React from 'react';
import { getFilteredDrugsByBrand } from '@/app/lib/actions';
import DrugListByBrand from '@/app/(dashboard)/inventory/available-stocks/_components/DrugListByBrand';

async function Page({ params }: {
    params: Promise<{ drugId: string, currentPage: number}>
}) {
    const { drugId, currentPage } = await params;
    const filteredDrugsByBrand = await getFilteredDrugsByBrand({
        page: currentPage,
        modelId: Number(drugId)
    });
    

    return (
        <div>
            <DrugListByBrand brands={filteredDrugsByBrand} />
        </div>
    );
}

export default Page;


