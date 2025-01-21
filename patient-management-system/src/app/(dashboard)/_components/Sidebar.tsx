import { FaStethoscope } from "react-icons/fa";
import {Suspense} from "react";
import SideBarLinksWrapper from "@/app/(dashboard)/_components/SideBarLinksWrapper";


export default function Sidebar() {
    return (
        <div className={"h-screen w-52 bg-primary-500 flex flex-col px-2 py-3 justify-start shadow-lg border-r-2 border-primary-900"}>
            <div className={"flex justify-center items-center gap-5 py-3 mb-10"}>
                <FaStethoscope className={"text-5xl text-white"}/>
                <span className={"text-2xl text-white font-extrabold"}>PMS</span>
            </div>
            <Suspense fallback={<div>Loading Links...</div>}>
                <SideBarLinksWrapper/>
            </Suspense>
        </div>
    );
}