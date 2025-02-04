import { toast, ToastPosition } from "react-toastify";

export function calcAge(birthDate: Date): number {
    const diff_ms = Date.now() - birthDate.getTime();
    const age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

type ServerActionResult = { success: boolean; message: string };

// Now the server action is just a function that returns a Promise<ServerActionResult>
type ServerAction = () => Promise<ServerActionResult>;

interface ActionOptions {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    position?: ToastPosition;
}

/**
 * Handles server actions with toast notifications.
 * @param action - The server action function with pre-bound parameters.
 * @param options - Toast options (optional).
 * @returns The result of the server action.
 */
export const handleServerAction = async (
    action: ServerAction,
    options: ActionOptions = {}
): Promise<ServerActionResult> => {
    const {
        loadingMessage = "Processing...",
        position = "bottom-right",
    } = options;

    const id = toast.loading(loadingMessage, { position, pauseOnFocusLoss: false });

    try {
        const result = await action();

        if (!result.success) {
            toast.update(id, {
                render: result.message || "An error occurred!",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
            return { success: false, message: result.message };
        }

        toast.update(id, {
            render: result.message || "Success!",
            type: "success",
            isLoading: false,
            autoClose: 2000,
        });
        return result;
    } catch (error) {
        toast.update(id, {
            render: error instanceof Error ? error.message : "An error occurred!",
            type: "error",
            isLoading: false,
            autoClose: 2000,
        });
        return { success: false, message: "An error occurred" };
    }
};