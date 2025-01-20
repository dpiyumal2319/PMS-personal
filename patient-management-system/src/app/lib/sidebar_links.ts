import type {ExpandingSidebarItem, SideBarItem as SideBarItemType} from "@/app/lib/definitions";
import {MdSpaceDashboard} from "react-icons/md";
import {BsFillPeopleFill} from "react-icons/bs";
import {FaClock} from "react-icons/fa";

export const DoctorLinks: (SideBarItemType | ExpandingSidebarItem)[] = [
    {
        icon: MdSpaceDashboard,
        name: "Dashboard",
        link: "/dashboard"
    },
    {
        icon: BsFillPeopleFill,
        name: "Patients",
        link: "/patients"
    },
    {
        icon: FaClock,
        name: "Queue",
        link: "/queue"
    }
];

export const NurseLinks: (SideBarItemType | ExpandingSidebarItem)[] = [
    {
        icon: MdSpaceDashboard,
        name: "Dashboard",
        link: "/dashboard"
    },
    {
        icon: BsFillPeopleFill,
        name: "Patients",
        link: "/patients"
    },
    {
        icon: FaClock,
        name: "Queue",
        link: "/queue"
    }
];