import React, { Suspense } from 'react';
import TableContents from "@/app/(dashboard)/queue/_components/TableContents";
import Loading from "@/app/(dashboard)/queue/Loading";

export default async function QueueTable({ currentPage, size }: { currentPage: number, size: number }) {
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-primary-100">
                <tr>
                    <th scope="col" className="px-6 py-3">Queue #</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Created</th>
                    <th scope="col" className="px-6 py-3">Patients</th>
                    <th scope="col" className="px-6 py-3">Action</th>
                </tr>
                </thead>
                <Suspense key={currentPage} fallback={
                    <tbody>
                    <tr>
                        <td colSpan={5} className="px-6 py-4 items-center text-center">
                                <Loading />
                        </td>
                    </tr>
                    </tbody>
                }>
                    <tbody>
                    <TableContents currentPage={currentPage} size={size} />
                    </tbody>
                </Suspense>
            </table>
        </div>
    );
}
