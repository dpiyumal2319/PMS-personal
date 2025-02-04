import type {ExpandingSidebarItem, SideBarItem as SideBarItemType} from "@/app/lib/definitions";
import {MdSpaceDashboard,MdAdminPanelSettings,MdDoneAll} from "react-icons/md";
import {BsFillPeopleFill,BsInboxFill} from "react-icons/bs";
import {FaClock,FaBox,FaMoneyBillWave,} from "react-icons/fa";

export const DoctorLinks: (SideBarItemType | ExpandingSidebarItem)[] = [
    {
        icon: MdSpaceDashboard,
        name: "Dashboard",
        link: "/dashboard"
    },
     {
        icon: MdAdminPanelSettings,
        name: "Admins",
        link: "/admin"
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
    },
    {
       
        icon: FaBox,
        name: " Inventory",
        initially_expanded: true,
        links: [
        {
            icon: BsInboxFill,
            name: "Available Stocks",
            link: "/inventory/available-stocks"
        },
        {
            icon: FaMoneyBillWave,
            name: "Cost Managment",
            link: "/inventory/cost-management"
        },
        {
            icon: MdDoneAll,
            name: "Completed Stocks",
            link: "/inventory/completed-stocks"
        }
    ]
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
    },
    {
       
        icon: FaBox,
        name: " Inventory",
        initially_expanded: true,
        links: [
        {
            icon: BsInboxFill,
            name: "Available Stocks",
            link: "/inventory/available-stocks"
        },
        {
            icon: FaMoneyBillWave,
            name: "Cost Managment",
            link: "/inventory/cost-management"
        },
        {
            icon: MdDoneAll,
            name: "Completed Stocks",
            link: "/inventory/completed-stocks"
        }
    ]
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