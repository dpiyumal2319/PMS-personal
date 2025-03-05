// lib/data.ts
import { Prisma, PrismaClient, BatchStatus, DrugType } from '@prisma/client'
import { Drug, FetchDrugsParams, FetchDrugsResult, DrugDetails } from './types'

// Singleton Prisma Client
const prisma = new PrismaClient()

export async function fetchDrugs({
  page = 1,
  per_page = 10,
  sort = 'expiry:asc',
  filters = {}
}: FetchDrugsParams): Promise<FetchDrugsResult> {
  try {
    // Prepare where conditions for filtering
    const whereConditions: Prisma.BatchWhereInput = {
      AND: [
        filters.drug_name ? { drug: { name: { equals: filters.drug_name, mode: 'insensitive' } } } : {},
        filters.drug_brand ? { drugBrand: { name: { equals: filters.drug_brand, mode: 'insensitive' } } } : {},
        filters.supplier ? { Supplier: { name: { equals: filters.supplier, mode: 'insensitive' } } } : {},
        filters.drug_type ? { type: filters.drug_type } : {},
        filters.batch_status ? { status: filters.batch_status } : {},
        filters.query ? {
          OR: [
            { drug: { name: { contains: filters.query, mode: 'insensitive' } } },
            { drugBrand: { name: { contains: filters.query, mode: 'insensitive' } } },
            { number: { contains: filters.query, mode: 'insensitive' } }
          ]
        } : {}
      ]
    }

    // Prepare sorting
    const [sortField, sortDirection] = sort.split(':')
    const orderBy: Prisma.BatchOrderByWithRelationInput =
      sortField === 'expiry' ? { expiry: sortDirection as any } :
        sortField === 'stock_date' ? { stockDate: sortDirection as any } :
          { id: 'desc' }

    // Fetch total count for pagination
    const totalItems = await prisma.batch.count({ where: whereConditions })
    const totalPages = Math.ceil(totalItems / per_page)

    // Fetch paginated drugs with related data
    const batches = await prisma.batch.findMany({
      where: whereConditions,
      orderBy,
      skip: (page - 1) * per_page,
      take: per_page,
      include: {
        drug: true,
        drugBrand: true,
        Supplier: true,
        unitConcentration: true
      }
    })

    // Transform Prisma Batch to Drug type
    const drugs: Drug[] = batches.map(batch => ({
      id: batch.id,
      name: batch.drug.name,
      brandName: batch.drugBrand.name,
      supplierName: batch.Supplier.name,
      batchNumber: batch.number,
      stockDate: batch.stockDate,
      expiryDate: batch.expiry,
      drugType: batch.type,
      batchStatus: batch.status,
      fullAmount: batch.fullAmount,
      remainingQuantity: batch.remainingQuantity,
      wholesalePrice: batch.wholesalePrice,
      retailPrice: batch.retailPrice,
      unitConcentration: batch.unitConcentration.concentration
    }))

    return {
      data: drugs,
      totalItems,
      totalPages
    }
  } catch (error) {
    console.error('Error fetching drugs:', error)
    throw error
  }
}

// Get drug details by ID
export async function getDrugById(id: number): Promise<DrugDetails | null> {
  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      drug: true,
      drugBrand: true,
      Supplier: true,
      unitConcentration: true,
      Issue: {
        select: {
          id: true,
          strategy: true,
          quantity: true,
          dose: true
        }
      }
    }
  })

  if (!batch) return null

  return {
    id: batch.id,
    name: batch.drug.name,
    brandName: batch.drugBrand.name,
    supplierName: batch.Supplier.name,
    batchNumber: batch.number,
    stockDate: batch.stockDate,
    expiryDate: batch.expiry,
    drugType: batch.type,
    batchStatus: batch.status,
    fullAmount: batch.fullAmount,
    remainingQuantity: batch.remainingQuantity,
    wholesalePrice: batch.wholesalePrice,
    retailPrice: batch.retailPrice,
    brand: batch.drugBrand,
    supplier: batch.Supplier,
    drug: batch.drug,
    unitConcentration: batch.unitConcentration,
    issues: batch.Issue.map(issue => ({
      id: issue.id,
      strategy: issue.strategy,
      quantity: issue.quantity,
      dose: issue.dose
    }))
  }
}

// Get filter options
export async function getDrugFilterOptions() {
  const [drugs, brands, suppliers, drugTypes, batchStatuses] = await Promise.all([
    prisma.drug.findMany({
      select: { name: true },
      distinct: ['name']
    }),
    prisma.drugBrand.findMany({
      select: { name: true },
      distinct: ['name']
    }),
    prisma.supplier.findMany({
      select: { name: true },
      distinct: ['name']
    }),
    prisma.$queryRaw<{ type: DrugType }[]>`SELECT DISTINCT type FROM "Batch"`,
    prisma.$queryRaw<{ status: BatchStatus }[]>`SELECT DISTINCT status FROM "Batch"`
  ])

  return {
    drugs: drugs.map(d => d.name),
    brands: brands.map(b => b.name),
    suppliers: suppliers.map(s => s.name),
    drugTypes: drugTypes.map(dt => dt.type),
    batchStatuses: batchStatuses.map(bs => bs.status)
  }
}

export default prisma