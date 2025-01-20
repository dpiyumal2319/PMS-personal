import { IconType } from "react-icons";

export type SessionPayload = {
    id: number;
    role: string;
}

export type SideBarItem = {
    icon: IconType,
    name: string,
    link: string
}

export type ExpandingSidebarItem = {
    icon: IconType,
    name: string,
    initially_expanded: boolean,
    links: SideBarItem[]
}