import Sidebar from "@/app/(dashboard)/_components/Sidebar";
import TopBar from "@/app/(dashboard)/_components/TopBar";
import React from "react";

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
            <div className="flex flex-col w-full h-screen">
                <div className={'sticky top-0'}>
                    <TopBar/>
                </div>
                <div className={'h-full'}>
                    {children}
                </div>
            </div>
        </div>
    );
}