import { IconType } from "react-icons";

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