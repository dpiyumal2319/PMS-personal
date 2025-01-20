import { verifySession } from "@/app/lib/sessions";
import SideBarLinks from "./SideBarLinks";

export default async function SideBarLinksWrapper() {
    const session = await verifySession(); // Fetch session on the server
    return <SideBarLinks role={session.role} />;
}
