// components/drugs/drugs.tsx
import { fetchDrugs } from '@/lib/data';
import { DrugCard } from '@/components/drugs/drug-card';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/drugs/columns';
import { Pagination } from '@/components/ui/pagination';

interface DrugsProps {
  page: number;
  per_page: number;
  sort: string;
  filters: {
    drug_name?: string;
    drug_brand?: string;
    supplier?: string;
    drug_model?: string;
    batch_status?: string;
    [key: string]: string | undefined;
  };
}

export async function Drugs({ page, per_page, sort, filters }: DrugsProps) {
  const { data, totalPages } = await fetchDrugs({ page, per_page, sort, filters });

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={data} />
      <Pagination totalPages={totalPages} currentPage={page} />
    </div>
  );
}

