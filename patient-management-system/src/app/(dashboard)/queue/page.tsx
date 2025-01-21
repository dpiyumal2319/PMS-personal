"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

const queues = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    number: `Q-${i + 1}`,
    status: i !== 0 ? "Completed" : "In Progress",
    date: new Date(2025, 0, i + 1).toLocaleDateString(),
    patients: Math.floor(Math.random() * 10) + 1,
}));

const QUEUES_PER_PAGE = 6;

export default function QueuePage() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const totalPages = Math.ceil(queues.length / QUEUES_PER_PAGE);

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        replace(`${pathname}?${params.toString()}`);
    };

    const displayedQueues = queues.slice(
        (currentPage - 1) * QUEUES_PER_PAGE,
        currentPage * QUEUES_PER_PAGE
    );

    return (
        <div>
            {/* Top Bar */}
            <div className="w-full bg-background-50 h-14 border-b border-primary-900/25 shadow flex items-center p-2">
                <p className="text-xl font-semibold">All Queues</p>
            </div>

            {/* Table Section */}
            <div className="p-4  flex flex-col items-center">
                <div className=" min-h-52 flex flex-col w-4/5">
                    {/*Add queue button*/}
                    <div className="flex justify-end p-4">
                        <a
                            href="/queue/add"
                            className="px-4 py-2 text-white bg-primary-400 rounded hover:bg-primary-500"
                        >
                            Add Queue
                        </a>
                    </div>
                    <table className="w-full text-left bg-white shadow-md rounded-md">
                        <thead className="bg-primary-100 border-b">
                        <tr>
                            <th className="p-3">Queue #</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Patients</th>
                            <th className="p-3 text-center">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {displayedQueues.map((queue) => (
                            <tr key={queue.id} className="border-b hover:bg-gray-100">
                                <td className="p-3">{queue.number}</td>
                                <td className="p-3">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded ${
                                                queue.status === "Completed"
                                                    ? "bg-green-200 text-green-800"
                                                        : "bg-blue-200 text-blue-800"
                                            }`}
                                        >
                                            {queue.status}
                                        </span>
                                </td>
                                <td className="p-3">{queue.date}</td>
                                <td className="p-3">{queue.patients}</td>
                                <td className="p-3 text-center">
                                    <a
                                        href={`/queue/${queue.id}`}
                                        className="px-3 py-2 text-white bg-primary-400 rounded hover:bg-primary-500"
                                    >
                                        View Queue
                                    </a>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center gap-2 mt-4 text-sm">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="px-4 py-2 text-white bg-gray-600 rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="px-4 py-2 text-white bg-gray-600 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
