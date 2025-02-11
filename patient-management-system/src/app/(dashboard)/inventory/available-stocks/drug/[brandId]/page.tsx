import React from 'react';
import { getFilteredDrugsByBrand } from '@/app/lib/actions';
import DrugListByBrand from '@/app/(dashboard)/inventory/available-stocks/_components/DrugListByBrand';

async function Page({ params }: {
    params: Promise<{ brandId: string, query: string, currentPage: number, selection: string, sort: string }>
}) {

    const { brandId, query, currentPage, selection, sort } = await params;
    const filteredDrugsByBrand = await getFilteredDrugsByBrand(query, currentPage, sort, Number(brandId));


    return (
        <div>
            <DrugListByBrand brands={filteredDrugsByBrand} />
        </div>
    );
}

export default Page;


