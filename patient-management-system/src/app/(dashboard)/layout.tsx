import Sidebar from "@/app/(dashboard)/_components/Sidebar";
import { logout} from "@/app/lib/auth";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex flex-col w-full">
                {children}
            </div>
            <button onClick={logout} className={"bg-primary text-white p-2 rounded"}>Logout</button>
        </div>
    );
}