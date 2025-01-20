'use client';

import type {ExpandingSidebarItem, SideBarItem} from "@/app/lib/definitions";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {FaChevronDown} from "react-icons/fa";

export function SideBarItem({item}: { item: SideBarItem }) {
    const pathname = usePathname();
    const isActive = pathname.startsWith(item.link); // Check if path starts with item.link

    return (
        <Link href={item.link} className={`flex items-center gap-2 p-2 rounded  
            ${isActive ? "bg-primary-600" : "hover:bg-primary-400"} 
            hover:ring-offset-0 hover:ring-2 ring-primary-200/50`
        }>
            <item.icon className="text-white text-xl"/>
            <span className="text-white">{item.name}</span>
        </Link>
    );
}

export function ExpandingSideBarItem({item}: { item: ExpandingSidebarItem }) {
    const [expanded, setExpanded] = useState(item.initially_expanded);

    return (
        <div className="flex flex-col">
            {/* Main Sidebar Item */}
            <div
                className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-primary-400 hover:ring-offset-0 hover:ring-2 ring-primary-200/50"
                onClick={() => setExpanded(!expanded)}
            >
                <item.icon className="text-white text-xl"/>
                <span className="text-white">{item.name}</span>
                <span className="ml-auto transform transition-transform duration-10 ease-in-out">
                <FaChevronDown className={`text-white ${expanded ? 'rotate-180' : 'rotate-0'}`}/>
                </span>

            </div>

            {/* Expandable Links with smooth transition */}
            <div
                className={`ml-6 flex flex-col overflow-hidden transition-all duration-1000 ease-in-out ${
                    expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                {expanded &&
                    item.links.map((link) => (
                        <SideBarItem key={link.name} item={link}/>
                    ))}
            </div>
        </div>
    );
}