import AddQueue from "@/app/(dashboard)/queue/_components/AddQueue";

export default function QueuePage() {

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
                    <AddQueue/>
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

                        <tr key={1} className="border-b hover:bg-gray-100">
                            <td className="p-3">1</td>
                            <td className="p-3">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded ${
                                                "Completed" === "Completed"
                                                    ? "bg-green-200 text-green-800"
                                                    : "bg-blue-200 text-blue-800"
                                            }`}
                                        >
                                            COMPLETED
                                        </span>
                            </td>
                            <td className="p-3">2022/2/2</td>
                            <td className="p-3">12</td>
                            <td className="p-3 text-center">
                                <a
                                    href={`/queue/1`}
                                    className="px-3 py-2 text-white bg-primary-400 rounded hover:bg-primary-500"
                                >
                                    View Queue
                                </a>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
