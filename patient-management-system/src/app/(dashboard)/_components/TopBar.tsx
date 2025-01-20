import { logout} from "@/app/lib/auth";
import { IoLogOutOutline } from "react-icons/io5";


export default function TopBar() {
    return (
        <div className={"h-14 bg-primary-400 flex items-center justify-between p-2"}>
            <div className={"relative flex items-center gap-2 bg-primary-500 p-2 rounded"}>
                <span className="animate-ping h-2 w-2 rounded-full bg-amber-600 -top-1 -right-1"></span>
                <span className={'font-bold text-white'}> 10 </span>
                <span className={'text-white'}>Patients</span>
            </div>
            <div className={"flex items-center hover:bg-primary-300 rounded p-2"}>
                <button onClick={logout}>
                    <IoLogOutOutline className={"text-white text-2xl"} />
                </button>
            </div>
        </div>
    );
}