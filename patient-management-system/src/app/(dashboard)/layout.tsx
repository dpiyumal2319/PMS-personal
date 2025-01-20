import Sidebar from "@/app/(dashboard)/_components/Sidebar";
import TopBar from "@/app/(dashboard)/_components/TopBar";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex flex-col w-full">
                <TopBar />
                {children}
            </div>
        </div>
    );
}