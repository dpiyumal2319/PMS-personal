import type {ExpandingSidebarItem, SideBarItem as SideBarItemType} from "@/app/lib/definitions";
import {MdSpaceDashboard, MdAdminPanelSettings} from "react-icons/md";
import {BsFillPeopleFill} from "react-icons/bs";
import {FaClock} from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";

export const DoctorLinks: (SideBarItemType | ExpandingSidebarItem)[] = [
    {
        icon: MdSpaceDashboard,
        name: "Dashboard",
        link: "/dashboard"
    },
    {
        icon: MdAdminPanelSettings,
        name: "Admins",
        initially_expanded: true,
        links: [
            {
                icon: MdAdminPanelSettings,
                name: "Admin",
                link: "/admin"
            },
            {
                icon: TbReportSearch,
                name: "Reports",
                link: "/admin/reports"
            }
        ]
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


//You can add expanding sidebar items like this
// {
//     icon: MdSpaceDashboard,
//     name: "Dashboard",
//     initially_expanded: true,
//     links: [
//         {
//             icon: MdSpaceDashboard,
//             name: "Dashboard",
//             link: "/dashboard"
//         },
//         {
//             icon: BsFillPeopleFill,
//             name: "Patients",
//             link: "/patients"
//         },
//         {
//             icon: FaClock,
//             name: "Queue",
//             link: "/queue"
//         }
//     ]
// }