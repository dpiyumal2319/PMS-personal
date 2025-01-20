'use client';

import {SideBarItem, ExpandingSideBarItem} from "./SideBarItem";
import type {ExpandingSidebarItem, SideBarItem as SideBarItemType} from "@/app/lib/definitions";
import {MdSpaceDashboard} from "react-icons/md";
import {BsFillPeopleFill} from "react-icons/bs";
import {FaBox} from "react-icons/fa";
import {FaEye} from "react-icons/fa";
import {IoMdAddCircle} from "react-icons/io";

export default function SideBarLinks(role: { role: string }) {

    return (
        <div className={"flex flex-col gap-2 "}>
            {DoctorLinks.map((item) => {
                    if ("links" in item) {
                        return <ExpandingSideBarItem item={item} key={item.name}/>;
                    } else {
                        return <SideBarItem item={item} key={item.name}/>;
                    }
                }
            )}
        </div>
    )
}

const DoctorLinks: (SideBarItemType | ExpandingSidebarItem)[] = [
    {
        icon: MdSpaceDashboard,
        name: "Dashboard",
        link: "/dashboard"
    },
    {
        icon: FaBox,
        name: "Inventory",
        initially_expanded: false,
        links: [
            {
                icon: FaEye,
                name: "View Inventory",
                link: "/inventory"
            },
            {
                icon: IoMdAddCircle,
                name: "Add Inventory",
                link: "/inventory/add"
            }
        ]
    },
    {
        icon: BsFillPeopleFill,
        name: "Patients",
        link: "/patients"
    }

];