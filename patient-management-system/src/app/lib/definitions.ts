import type {LucideIcon} from "lucide-react";
import {z} from "zod";
import {Role} from '@prisma/client';

export type SessionPayload = {
    id: number;
    role: Role;
}

export type SidebarLinkItem = {
    type: "link";
    icon?: LucideIcon;
    title: string;
    url: string;
    isActive: boolean;
};

export type SidebarExpandableItem = {
    type: "expandable";
    title: string;
    icon?: LucideIcon;
    initiallyExpanded: boolean;
    items: SidebarLinkItem[];
};

export type SidebarItem = SidebarLinkItem | SidebarExpandableItem;

export type myError = {
    success: boolean,
    message: string
}

export type myBillError = {
    success: boolean,
    message: string,
    bill?: Bill | null
}

export interface Parameter {
    name: string;
    units: string;
}

export interface ReportForm {
    name: string;
    description: string;
    parameters: Parameter[];
}

export type PatientFormData = {
    name: string;
    NIC: string;
    telephone: string;
    birthDate: string;
    address: string;
    height: string;  // Keep as string since input fields return strings
    weight: string;  // Keep as string since input fields return strings
    gender: "MALE" | "FEMALE" | ""
};

export type InventoryFormData = {
    drugName: string;
    brandName: string;
    brandDescription?: string;
    batchNumber: string;
    drugType: string;
    quantity: number | string;
    expiry: string;
    retailPrice: number | string;
    wholesalePrice: number | string;
    brandId?: number; // Add brandId property
    drugId?: number;  // Add drugId property
}


// export type InventoryFormData = {
//     brandName: string,
//     brandDescription: string,
//     drugName: string,
//     batchNumber: string,
//     drugType: string,
//     quantity: number,
//     expiry: string,
//     price: number
// };

export const searchModels = [
    {
        label: "By Brand",
        value: "brand",
        sortOptions: [
            {label: "Alphabetically", value: "alphabetically"},
            {label: "Lowest", value: "lowest"},
            {label: "Highest", value: "highest"},
        ],
    },
    {
        label: "By Model",
        value: "model",
        sortOptions: [
            {label: "Alphabetically", value: "alphabetically"},
            {label: "Lowest", value: "lowest"},
            {label: "Highest", value: "highest"},
        ],
    },
    {
        label: "By Batch",
        value: "batch",
        sortOptions: [
            {label: "Expiry Date", value: "expiryDate"},
            {label: "Newly Added", value: "newlyAdded"},
            {label: "Alphabetically", value: "alphabetically"},
        ],
    },
];

//search models for cost management

export const searchModelsCM = [
    {
        label: "By Brand",
        value: "brand",
        sortOptions: [
            {label: "Alphabetically", value: "alphabetically"},
            {label: "Total Cost", value: "totalcost"},
            {label: "Cost Per Unit", value: "costperunit"},
        ],
    },
    {
        label: "By Model",
        value: "model",
        sortOptions: [
            {label: "Alphabetically", value: "alphabetically"},
            {label: "Total Cost", value: "totalcost"},
            {label: "Cost Per Unit", value: "costperunit"},
        ],
    },
    {
        label: "By Batch",
        value: "batch",
        sortOptions: [
            {label: "Total Cost", value: "totalcost"},
            {label: "Cost Per Unit", value: "costperunit"},
            {label: "Alphabetically", value: "alphabetically"},
        ],
    },
];

export interface StockData {
    id: number;
    name: string;
    totalPrice: number;
    retailPrice?: number;
    wholesalePrice?: number;
    remainingQuantity?: number;
}

export type SortOption = "alphabetically" | "highest" | "lowest" | "unit-highest" | "unit-lowest";

export interface StockQueryParams {
    query?: string;
    page?: number;
    sort?: SortOption;
    startDate?: Date;
    endDate?: Date;
}

// types for inventory cost analysis

export interface StockAnalysis {
    available: number;  // Total value of available drugs
    sold: number;      // Total value of sold drugs
    expired: number;   // Total value of expired drugs
    trashed: number;   // Total value of trashed drugs
    errors: number;    // Total value of drugs with errors
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface BatchAnalysisData {
    id: number;
    status: string;
    price: number;
    fullAmount: number;
    remainingQuantity: number;
    stockDate: Date;
    expiry: Date;
}

export interface PieChartData {
    name: string;
    value: number;
    color: string;
}

export interface DrugBrandSuggestion {
    id: number;
    name: string;

}

export interface DrugModelSuggestion {
    id: number;
    name: string;
}


const MealStrategySchema = z.object({
    breakfast: z.object({
        active: z.boolean(),
        dose: z.number(),
    }),
    lunch: z.object({
        active: z.boolean(),
        dose: z.number(),
    }),
    dinner: z.object({
        active: z.boolean(),
        dose: z.number(),
    }),
    forDays: z.number(),
    afterMeal: z.boolean(),
    minutesBeforeAfterMeal: z.number(),
});


const WhenNeededStrategySchema = z.object({
    dose: z.number(),
    times: z.number(),
});

const PeriodicStrategySchema = z.object({
    interval: z.number(), // in hours
    dose: z.number(),
    forDays: z.number(),
});

const OtherStrategySchema = z.object({
    details: z.string(),
    dose: z.number(),
    times: z.number(),
});

export const StrategyJsonSchema = z.discriminatedUnion("name", [
    z.object({name: z.literal("MEAL"), strategy: MealStrategySchema}),
    z.object({name: z.literal("WHEN_NEEDED"), strategy: WhenNeededStrategySchema}),
    z.object({name: z.literal("PERIODIC"), strategy: PeriodicStrategySchema}),
    z.object({name: z.literal("OTHER"), strategy: OtherStrategySchema}),
]);

export type StrategyJson = z.infer<typeof StrategyJsonSchema>;
export type MealStrategy = z.infer<typeof MealStrategySchema>;
export type WhenNeededStrategy = z.infer<typeof WhenNeededStrategySchema>;
export type PeriodicStrategy = z.infer<typeof PeriodicStrategySchema>;
export type OtherStrategy = z.infer<typeof OtherStrategySchema>;

export type BillEntry = {
    drugName: string;
    brandName: string;
    quantity: number;
    unitPrice: number;
}

export type Bill = {
    prescriptionID: number;
    patientName: string;
    entries: BillEntry[];
    cost: number;
    patientID: number;
    dispensary_charge: number;
    doctor_charge: number
}