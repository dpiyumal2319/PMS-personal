import Sidebar from "@/app/(dashboard)/_components/Sidebar";
import TopBar from "@/app/(dashboard)/_components/TopBar";
import React, {Suspense} from "react";
import Loading from "@/app/(dashboard)/Loading";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
            <aside className={"sticky top-0 left-0"}>
                <Sidebar/>
            </aside>
            <div className="flex flex-col w-full overflow-y-scroll">
                <div className={'sticky top-0 z-100'}>
                    <TopBar/>
                </div>
                <div className={'flex-grow'}>
                    <Suspense fallback={<Loading />}>
                        {children}
                    </ Suspense>
                </div>
            </div>
        </div>
    );
}