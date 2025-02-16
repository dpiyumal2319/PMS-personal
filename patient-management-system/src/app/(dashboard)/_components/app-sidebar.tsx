import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader
} from "@/components/ui/sidebar"
import AppSidebarLinks from "@/app/(dashboard)/_components/app-sidebar-links";
import {Role} from "@prisma/client";
import {Stethoscope} from 'lucide-react';

export function AppSidebar() {
    return (
        <Sidebar className="h-screen border-r">
            <SidebarHeader className="p-4 border-b">
                <div className="flex items-center space-x-3">
                    <div className="bg-primary p-2 rounded-md">
                        <Stethoscope className="h-6 w-6 text-primary-foreground"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">MediPanel</h2>
                        <p className="text-sm">Healthcare Management</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <AppSidebarLinks role={Role.DOCTOR}/>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t">
                <p className="text-xs text-center">
                    © 2025 ColorNovels
                </p>
            </SidebarFooter>
        </Sidebar>
    )
}