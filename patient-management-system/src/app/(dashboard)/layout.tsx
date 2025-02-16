// DashboardLayout
import TopBar from "@/app/(dashboard)/_components/TopBar";
import React, {Suspense} from "react";
import Loading from "@/app/(dashboard)/loading";
import {SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/app/(dashboard)/_components/app-sidebar";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        // <div className="flex h-screen">
        //     <aside className={"fixed top-0 left-0 h-full w-[250px] z-50"}>
        //         <Sidebar/>
        //     </aside>
        //     <div className="flex flex-col w-full h-full ml-[250px]">
        //         <div className={'sticky top-0 z-10 w-full'}>
        //             <TopBar/>
        //         </div>
        //         <main className={'flex-grow overflow-y-auto'}>
        //             <Suspense fallback={<Loading />}>
        //                 {children}
        //             </Suspense>
        //         </main>
        //     </div>
        // </div>
        <SidebarProvider>
            <AppSidebar/>
            <main className={"flex flex-col w-full h-full"}>
                <TopBar/>
                <Suspense fallback={<Loading/>}>
                    {children}
                </Suspense>
            </main>
        </SidebarProvider>
    );
}