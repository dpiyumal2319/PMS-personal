import React, { Suspense } from 'react';
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { LoadingRows } from "@/app/(dashboard)/queue/Loading";
import AllPatientsContent from "@/app/(dashboard)/queue/[id]/_components/AllPatientsContent";

// Main Table Component
export default function AllPatientsTable({ id }: { id : number }) {
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Token #</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead >Sex</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Arrive At</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <Suspense fallback={<LoadingRows rows={5} cols={7} />}>
                    <AllPatientsContent id={id} />
                </Suspense>
            </Table>
        </div>
    );
}