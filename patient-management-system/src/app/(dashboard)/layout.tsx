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
        <div className="flex">
            <aside className={"sticky top-0 left-0 h-screen"}>
                <Sidebar/>
            </aside>
            <div className="flex flex-col w-full">
                <div className={'sticky top-0'}>
                    <TopBar/>
                </div>
                <div>
                    <Suspense fallback={<Loading />}>
                        {children}
                    </ Suspense>
                </div>
            </div>
        </div>
    );
}