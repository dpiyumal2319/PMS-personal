import { toast, ToastPosition } from "react-toastify";
import {StrategyJson} from "@/app/lib/definitions";
import {z} from "zod";

export function calcAge(birthDate: Date): number {
    const diff_ms = Date.now() - birthDate.getTime();
    const age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

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


export function calculateQuantity(strategy: StrategyJson): number {
    switch (strategy.name) {
        case 'MEAL': {
            const mealStrategy = strategy.strategy
            let dailyDoses = 0;

            if (mealStrategy.breakfast.active) {
                dailyDoses += mealStrategy.breakfast.dose;
            }
            if (mealStrategy.lunch.active) {
                dailyDoses += mealStrategy.lunch.dose;
            }
            if (mealStrategy.dinner.active) {
                dailyDoses += mealStrategy.dinner.dose;
            }

            return dailyDoses * mealStrategy.forDays;
        }

        case 'WHEN_NEEDED' : {
            const whenNeededStrategy = strategy.strategy
            return whenNeededStrategy.dose * whenNeededStrategy.times;
        }

        case 'PERIODIC': {
            const periodicStrategy = strategy.strategy
            const dosesPerDay = 24 / periodicStrategy.interval;
            return Math.ceil(dosesPerDay * periodicStrategy.dose * periodicStrategy.forDays);
        }

        case 'OTHER': {
            const otherStrategy = strategy.strategy
            return otherStrategy.dose * otherStrategy.times;
        }

        default:
            throw new Error(`Unknown strategy type`);
    }
}


const emailSchema = z.string().email("Invalid email format");

const mobileSchema = z
    .string()
    .regex(/^\d{10}$/, "Invalid mobile number (must be 10 digits)");

export const validateEmail = (email: string) => {
    const result = emailSchema.safeParse(email);
    return result.success ? null : result.error.errors[0].message;
};

export const validateMobile = (mobile: string) => {
    const result = mobileSchema.safeParse(mobile);
    return result.success ? null : result.error.errors[0].message;
};