// lib/types.ts
export interface Drug {
    id: string;
    name: string;
    brand: string;
    supplier: string;
    batchNumber: string;
    stockDate: string;
    expiryDate: string;
    drugModel: "Tablet" | "Syrup" | "Injection" | "Capsule" | "Cream";
    batchStatus: "Available" | "Completed" | "Expired" | "Disposed" | "Quality Failed";
    fullAmount: number;
    remainingAmount: number;
    unitConcentration: string;
  }
  
  export interface FetchDrugsParams {
    page: number;
    per_page: number;
    sort: string;
    filters: {
      drug_name?: string;
      drug_brand?: string;
      supplier?: string;
      drug_model?: string;
      batch_status?: string;
      [key: string]: string | undefined;
    };
  }
  
  export type FetchDrugsResult = {
    data: Drug[];
    totalItems: number;
    totalPages: number;
  };
  
 
  
  