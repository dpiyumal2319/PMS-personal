// app/inventory/all-drugs/page.tsx
import { Suspense } from 'react';
import { Drugs } from './_components/Drugs';
import { DashboardShell } from './_components/ui/dashboard-shell';
import { DashboardHeader } from './_components/ui/dashboard-header';
import { FilterSidebar } from './_components/FilterSidebar';
import { SearchAndSort } from './_components/SearchAndSort';
import { BatchStatus, DrugType } from '@prisma/client';

interface SearchParams {
    page?: string;
    per_page?: string;
    sort?: string;
    query?: string;
    drugName?: string;
    drugBrand?: string;
    supplier?: string;
    drugType?: string;
    batchStatus?: string;

    [key: string]: string | undefined;
}

export default async function DrugsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    // Await searchParams if it's a promise (though it shouldn't be in Next.js 13+)
    const params = await Promise.resolve(searchParams);

    const page = params.page ? parseInt(params.page) : 1;
    const per_page = params.per_page ? parseInt(params.per_page) : 10;
    const sort = params.sort || 'stockDate:desc';

    // Extract and convert filter parameters
    const filters = {
        query: params.query,
        drug_brand: params.drugBrand,
        supplier: params.supplier,
        drug_model: params.drugModel,
        drug_type: params.drugType ? params.drugType as DrugType : undefined,
        batch_status: params.batchStatus ? params.batchStatus as BatchStatus : undefined,
    };

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Drugs Inventory"
                description="Manage your pharmacy inventory with advanced filtering and sorting options."
            />
            <div className="flex flex-col md:flex-row gap-6">
                <FilterSidebar className="w-full md:w-64 flex-shrink-0"/>
                <div className="flex-1 space-y-4">
                    <SearchAndSort/>
                    <Suspense fallback={<DrugsTableSkeleton/>}>
                        <Drugs
                            page={page}
                            per_page={per_page}
                            sort={sort}
                            filters={filters}
                        />
                    </Suspense>
                </div>
            </div>
        </DashboardShell>
    );
}

function DrugsTableSkeleton() {
    return (
        <div className="rounded-md border border-input">
            <div className="p-4 space-y-4">
                {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="w-full h-12 bg-muted animate-pulse rounded-md"/>
                ))}
            </div>
        </div>
    );
}