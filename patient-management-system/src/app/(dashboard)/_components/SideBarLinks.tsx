'use client';
import {SideBarItem, ExpandingSideBarItem} from "./SideBarItem";
import type { SessionPayload} from "@/app/lib/definitions";
import {DoctorLinks, NurseLinks} from "@/app/lib/sidebar_links";


export default function SideBarLinks({session}: { session: SessionPayload }) {

    return (
        <div className={"flex flex-col gap-2 "}>
            {session.role === "doctor" &&
                DoctorLinks.map((item) => {
                    if ("links" in item) {
                        return <ExpandingSideBarItem item={item} key={item.name} />;
                    } else {
                        return <SideBarItem item={item} key={item.name} />;
                    }
                })
            }

            {session.role === "nurse" &&
                NurseLinks.map((item) => {
                    if ("links" in item) {
                        return <ExpandingSideBarItem item={item} key={item.name} />;
                    } else {
                        return <SideBarItem item={item} key={item.name} />;
                    }
                })
            }
        </div>
    );
}