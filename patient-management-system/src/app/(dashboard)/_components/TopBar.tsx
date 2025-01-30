import { logout} from "@/app/lib/auth";
import { IoLogOutOutline } from "react-icons/io5";


export default function TopBar() {
    return (
        <div className={"h-14 bg-background-50 flex items-center justify-between p-2 border-b border-primary-900/25 shadow"}>
            <div className={"relative flex items-center gap-2 bg-primary-500 p-2 rounded text-white"}>
                <span className="animate-ping h-2 w-2 rounded-full bg-amber-400 "></span>
                <span className={'font-bold'}> 10 </span>
                <span >Patients</span>
            </div>
            <div className={"flex items-center hover:bg-background-200 rounded-full p-2"}>
                <button onClick={logout}>
                    <IoLogOutOutline className={"text-2xl"} />
                </button>
            </div>
        </div>
    );
}