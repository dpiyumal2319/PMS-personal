// lib/types.ts
import { 
  BatchStatus, 
  DrugType, 
  IssuingStrategy, 
  UnitConcentration, 
  DrugBrand, 
  Supplier, 
  Drug as PrismaDrug 
} from '@prisma/client'

export interface Drug {
  id: number
  name: string
  brandName: string
  supplierName: string
  batchNumber: string
  stockDate: Date
  expiryDate: Date
  drugType: DrugType
  batchStatus: BatchStatus
  fullAmount: number
  remainingQuantity: number
  wholesalePrice: number
  retailPrice: number
  unitConcentration: number
}

export interface FetchDrugsParams {
  page?: number
  per_page?: number
  sort?: string
  filters?: {
    query?: string
    drug_name?: string
    drug_brand?: string
    supplier?: string
    drug_type?: DrugType
    batch_status?: BatchStatus
  }
}

export interface FetchDrugsResult {
  data: Drug[]
  totalItems: number
  totalPages: number
}

export interface DrugDetails extends Drug {
  brand: DrugBrand
  supplier: Supplier
  drug: PrismaDrug
  unitConcentration: UnitConcentration
  issues?: {
    id: number
    strategy: IssuingStrategy
    quantity: number
    dose: number
  }[]
}