import AddQueue from "@/app/(dashboard)/queue/_components/AddQueue";
import QueueTable from "@/app/(dashboard)/queue/_components/QueueTable";
import DatePicker from "@/app/(dashboard)/queue/_components/DatePicker";

export default function QueuePage() {

    return (
        <div>
            {/* Top Bar */}
            <div className="flex justify-between w-full bg-background-50 h-14 border-b border-primary-900/25 shadow flex items-center p-2">
                <p className="text-xl font-semibold">All Queues</p>
                <AddQueue/>
            </div>

            {/* Table Section */}
            <div className="p-4  flex flex-col items-center">
                <div className=" min-h-52 flex flex-col w-4/5">
                    {/*Table*/}
                    <QueueTable/>
                </div>
            </div>
        </div>
    );
}
