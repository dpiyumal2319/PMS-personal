import { logout} from "@/app/lib/auth";
import { IoLogOutOutline } from "react-icons/io5";
import PendingPatients from "@/app/(dashboard)/_components/PendingPatients";


export default function TopBar() {
    return (
        <div className={"h-14 bg-white flex items-center justify-between py-3 px-4 border-b border-primary-900/25 shadow"}>
            <PendingPatients />
            <div className={"flex items-center hover:bg-background-200 rounded-full p-2"}>
                <button onClick={logout}>
                    <IoLogOutOutline className={"text-2xl"} />
                </button>
            </div>
        </div>
    );
}