import AddQueue from "@/app/(dashboard)/queue/_components/AddQueue";
import QueueTable from "@/app/(dashboard)/queue/_components/QueueTable";
import Pagination from "@/app/(dashboard)/queue/_components/Pagination";
import {getTotalQueueCount} from "@/app/lib/actions";

const rowsPerPage = 6;

export default async function Page(props: {
    searchParams?: Promise<{
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams?.page) || 1;
    const queues = await getTotalQueueCount();

    return (
        <div>
            {/* Top Bar */}
            <div
                className="flex justify-between w-full bg-background-50 h-14 border-b border-primary-900/25 shadow items-center p-2">
                <p className="text-xl font-semibold">All Queues</p>
                <AddQueue/>
            </div>

            {/* Table Section */}
            <div className="p-4  flex flex-col items-center">
                <div className=" min-h-52 flex flex-col w-4/5">
                    {/*Table*/}
                    <QueueTable currentPage={currentPage} size={rowsPerPage}/>
                </div>

                <div className={'mt-2.5 shadow-md'}>
                    <Pagination queues={queues} size={rowsPerPage} />
                </div>
            </div>


        </div>
    );
}
