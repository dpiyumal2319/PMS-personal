import React from 'react';
import Link from "next/link";
import {getQueues} from "@/app/lib/actions";

async function TableContents({ currentPage, size }: { currentPage: number, size: number }) {
    const queues = await getQueues((currentPage - 1) * size, size);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-200 text-green-900';
            case 'IN_PROGRESS':
                return 'bg-yellow-200 text-yellow-900';
            default:
                return 'bg-gray-200 text-gray-900';
        }
    };

    return (
        <>
        {queues.map((queue) => (
                <tr key={queue.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                    <th scope="row" className="px-6 py-4 font-medium">Queue {queue.id}</th>
                    <td className="px-6 py-4">
                                <span className={`px-2.5 py-0.5 rounded-md font-medium ${getStatusColor(queue.status)}`}>
                                    {queue.status.replace('_', ' ')}
                                </span>
                    </td>
                    <td className="px-6 py-4">{new Date(queue.start).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{queue._count.entries}</td>
                    <td className="px-6 py-4">
                        <Link href={`#`} className="text-white bg-primary hover:bg-primary-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5  focus:outline-none">
                            View
                        </Link>
                    </td>
                </tr>
            ))}
        </>
    );
}

export default TableContents;