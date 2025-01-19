import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export async function getRole() : Promise<string> {
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get("role");

    if (!roleCookie) {
        redirect("/login");
    }

    // Safely cast the value of the cookie to a string
    return roleCookie.value;
}
