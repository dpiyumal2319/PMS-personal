import Sidebar from "@/app/(dashboard)/_components/Sidebar";
import TopBar from "@/app/(dashboard)/_components/TopBar";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex">
            <aside className={"h-screen sticky top-0"}>
                <Sidebar/>
            </aside>
            <div className="flex flex-col w-full">
                <div className={'sticky top-0'}>
                    <TopBar/>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}