import {toast, ToastPosition} from "react-toastify";
import {z} from "zod";
import {IssuingStrategy} from "@prisma/client";
import {BasicColorType} from "@/app/(dashboard)/_components/CustomBadge";

export function calcAge(birthDate: Date): number {
    const diff_ms = Date.now() - birthDate.getTime();
    const age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

// Get the text color class based on the selected color
export const getTextColorClass = (color: keyof BasicColorType) => {
    const iconColorMap: Record<keyof BasicColorType, string> = {
        slate: "text-slate-600",
        gray: "text-gray-600",
        zinc: "text-zinc-600",
        neutral: "text-neutral-600",
        stone: "text-stone-600",
        red: "text-red-600",
        orange: "text-orange-600",
        amber: "text-amber-600",
        yellow: "text-yellow-600",
        lime: "text-lime-600",
        green: "text-green-600",
        emerald: "text-emerald-600",
        teal: "text-teal-600",
        cyan: "text-cyan-600",
        sky: "text-sky-600",
        blue: "text-blue-600",
        indigo: "text-indigo-600",
        violet: "text-violet-600",
        purple: "text-purple-600",
        fuchsia: "text-fuchsia-600",
        pink: "text-pink-600",
        rose: "text-rose-600",
        destructive: "",
        okay: ""
    };

    return iconColorMap[color] || "text-gray-600";
};

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

    const id = toast.loading(loadingMessage, {position, pauseOnFocusLoss: false});

    try {
        const result = await action();

        if (!result.success) {
            toast.update(id, {
                render: result.message || "An error occurred!",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
            return {success: false, message: result.message};
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
        return {success: false, message: "An error occurred"};
    }
};


export function calculateQuantity({
                                      strategy,
                                      dose,
                                      forDays,
                                      times
                                  }: {
    strategy: IssuingStrategy,
    dose: number,
    forDays: number
    times?: number
}): number {
    switch (strategy) {
        case IssuingStrategy.TDS: // Three times a day
            return dose * 3 * forDays;

        case IssuingStrategy.BD: // Twice a day
            return dose * 2 * forDays;

        case IssuingStrategy.OD: // Once daily
            return dose * forDays;

        case IssuingStrategy.QDS: // Four times a day (every 6 hours)
            return dose * 4 * forDays;

        case 'SOS': // When needed (can't calculate exact quantity)
            if (times) return dose * times;
            throw new Error(`Times must be provided for SOS strategy`);

        case 'WEEKLY': // Once per week times is required
            if (times) return dose * times;
            throw new Error(`Times must be provided for WEEKLY strategy`);

        case IssuingStrategy.NOCTE: // At night
        case IssuingStrategy.MANE: // In the morning
        case IssuingStrategy.VESPE : // In the evening
        case IssuingStrategy.NOON: // At noon
            return dose * forDays;

        case 'OTHER':
            if (times) return dose * times;
            throw new Error(`Times must be provided for OTHER strategy`);


        default:
            throw new Error(`Unknown strategy type`);
    }
}

export function calculateForDays({
                                     strategy,
                                     dose,
                                     quantity,
                                 }: {
    strategy: IssuingStrategy;
    dose: number;
    quantity: number;
    times?: number;
}): number | null {
    switch (strategy) {
        case IssuingStrategy.TDS: // Three times a day
            return Math.floor(quantity / (dose * 3));

        case IssuingStrategy.BD: // Twice a day
            return Math.floor(quantity / (dose * 2));

        case IssuingStrategy.OD: // Once daily
            return Math.floor(quantity / dose);

        case IssuingStrategy.QDS: // Four times a day
            return Math.floor(quantity / (dose * 4));

        case 'SOS': // When needed
        case 'OTHER':
            return null;

        case IssuingStrategy.NOCTE: // At night
        case IssuingStrategy.MANE: // In the morning
        case IssuingStrategy.VESPE: // In the evening
        case IssuingStrategy.NOON: // At noon
            return Math.floor(quantity / dose);

        case 'WEEKLY': // Once per week
            return Math.ceil((quantity / dose) * 7);

        default:
            throw new Error(`Unknown strategy type`);
    }
}

export function calculateTimes({
                                   strategy,
                                   dose,
                                   quantity,
                               }: {
    strategy: IssuingStrategy;
    dose: number;
    quantity: number;
}): number {
    switch (strategy) {
        case IssuingStrategy.TDS: // Three times a day
            return Math.floor(quantity / (dose * 3));

        case IssuingStrategy.BD: // Twice a day
            return Math.floor(quantity / (dose * 2));

        case IssuingStrategy.OD: // Once daily
            return Math.floor(quantity / dose);

        case IssuingStrategy.QDS: // Four times a day
            return Math.floor(quantity / (dose * 4));

        case 'SOS': // When needed
        case 'OTHER':
            return Math.floor(quantity / dose);

        case IssuingStrategy.NOCTE: // At night
        case IssuingStrategy.MANE: // In the morning
        case IssuingStrategy.VESPE: // In the evening
        case IssuingStrategy.NOON: // At noon
            return Math.floor(quantity / dose);

        case 'WEEKLY': // Once per week
            return Math.floor(quantity / dose);

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