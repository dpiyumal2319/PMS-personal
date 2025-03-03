// app/drugs/page.tsx
import {Suspense} from 'react';
import {Drugs} from './_components/Drugs';
import {DashboardShell} from './_components/ui/dashboard-shell';
import {DashboardHeader} from './_components/ui/dashboard-header';
import {FilterSidebar} from './_components/FilterSidebar';
import {SearchAndSort} from './_components/SearchAndSort';

interface SearchParams {
    page?: string;
    per_page?: string;
    sort?: string;
    drug_name?: string;
    drug_brand?: string;
    supplier?: string;
    drug_model?: string;
    batch_status?: string;

    [key: string]: string | undefined;
}

export default async function DrugsPage({
                                            searchParams,
                                        }: {
    searchParams: Promise<SearchParams>;
}) {
    const awaited = await searchParams;

    const page = awaited.page ? parseInt(awaited.page) : 1;
    const per_page = awaited.per_page ? parseInt(awaited.per_page) : 10;
    const sort = awaited.sort || 'expiry_date:asc';

    // Extract all filter parameters
    const filters = {
        drug_name: awaited.drug_name,
        drug_brand: awaited.drug_brand,
        supplier: awaited.supplier,
        drug_model: awaited.drug_model,
        batch_status: awaited.batch_status,
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