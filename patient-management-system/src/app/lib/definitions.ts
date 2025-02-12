import { IconType } from "react-icons";
import { IssueingStrategy } from "@prisma/client";

export type MealStrategy = {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    quantity: number;
    beforeAfterMeal: boolean;
    minutesBeforeAfterMeal: number;
};

export type WhenNeededStrategy = {
    quantity: number;
};

export type PeriodicStrategy = {
    interval: number;
    quantity: number;
};

export type OffRecordStrategy = {
    details: string;
    quantity: number;
};

export type OtherStrategy = {
    details: string;
    quantity: number;
};

export type StrategyJson = {
    name: IssueingStrategy;
    strategy: MealStrategy | WhenNeededStrategy | PeriodicStrategy | OffRecordStrategy | OtherStrategy;
}

export type SessionPayload = {
    id: number;
    name: string;
    email: string;
    role: string;
}

export type SideBarItem = {
    icon: IconType,
    name: string,
    link: string
}

export type ExpandingSidebarItem = {
    icon: IconType,
    name: string,
    initially_expanded: boolean,
    links: SideBarItem[]
}

export type myError = {
    success: boolean,
    message: string
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

export type InventoryFormData= {
    drugName: string;
    brandName: string;
    brandDescription?: string;
    batchNumber: string;
    drugType: string;
    quantity: number | string;
    expiry: string;
    price: number | string;
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
        { label: "Alphabetically", value: "alphabetically" },
        { label: "Lowest", value: "lowest" },
        { label: "Highest", value: "highest" },
      ],
    },
    {
      label: "By Model",
      value: "model",
      sortOptions: [
        { label: "Alphabetically", value: "alphabetically" },
        { label: "Lowest", value: "lowest" },
        { label: "Highest", value: "highest" },
      ],
    },
    {
      label: "By Batch",
      value: "batch",
      sortOptions: [
        { label: "Expiry Date", value: "expiryDate" },
        { label: "Newly Added", value: "newlyAdded" },
        { label: "Alphabetically", value: "alphabetically" },
      ],
    },
  ];

  //search models for cost management

  export const searchModelsCM = [
    {
      label: "By Brand",
      value: "brand",
      sortOptions: [
        { label: "Alphabetically", value: "alphabetically" },
        { label: "Total Cost", value: "totalcost" },
        { label: "Cost Per Unit", value: "costperunit" },
      ],
    },
    {
      label: "By Model",
      value: "model",
      sortOptions: [
        { label: "Alphabetically", value: "alphabetically" },
        { label: "Total Cost", value: "totalcost" },
        { label: "Cost Per Unit", value: "costperunit" },
      ],
    },
    {
      label: "By Batch",
      value: "batch",
      sortOptions: [
        { label: "Total Cost", value: "totalcost" },
        { label: "Cost Per Unit", value: "costperunit" },
        { label: "Alphabetically", value: "alphabetically" },
      ],
    },
  ];

export interface StockData {
    id: number;
    name: string;
    totalPrice: number;
    unitPrice?: number;
    remainingQuantity?: number;
}

export type SortOption = "alphabetically" | "highest" | "lowest" | "unit-highest" | "unit-lowest";

export interface StockQueryParams {
    query?: string;
    page?: number;
    sort?: SortOption;
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