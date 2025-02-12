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




export type InventoryFormData = {
    brandName: string,
    brandDescription: string,
    drugName: string,
    batchNumber: string,
    drugType: string,
    quantity: number,
    expiry: string,
    price: number
};

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