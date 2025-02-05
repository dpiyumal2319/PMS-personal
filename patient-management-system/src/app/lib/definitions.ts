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
  

}

export type InventoryFormData = {
    brandName: string,
    brandDescription: string,
    drugName: string,
    batchNumber: string,
    drugType: string,
    quantity: number,
    expiry: Date,
    price: number
};

