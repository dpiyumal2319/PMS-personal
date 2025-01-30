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
            <aside className={"h-full sticky top-0"}>
                <Sidebar/>
            </aside>
            <div className="flex flex-col w-full h-screen">
                <div className={'sticky top-0'}>
                    <TopBar/>
                </div>
                <div className={'h-full'}>
                    <Suspense fallback={<Loading />}>
                        {children}
                    </ Suspense>
                </div>
            </div>
        </div>
    );
}