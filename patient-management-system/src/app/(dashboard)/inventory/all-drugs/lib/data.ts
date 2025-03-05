'use server'

import { Drug, FetchDrugsParams, FetchDrugsResult } from './types'
import { Prisma } from '@prisma/client'
import {prisma} from '@/app/lib/prisma'


export async function fetchDrugs({
  page = 1,
  per_page = 10,
  sort = 'expiry:asc',
  filters = {}
}: FetchDrugsParams): Promise<FetchDrugsResult> {
  try {
    // Create a type-safe where condition
    const whereConditions: Prisma.BatchWhereInput = {
      ...(filters.drug_name && {
        drug: {
          name: { 
            equals: filters.drug_name, 
            mode: 'insensitive' 
          }
        }
      }),
      ...(filters.drug_brand && {
        drugBrand: {
          name: { 
            equals: filters.drug_brand, 
            mode: 'insensitive' 
          }
        }
      }),
      ...(filters.supplier && {
        Supplier: {
          name: { 
            equals: filters.supplier, 
            mode: 'insensitive' 
          }
        }
      }),
      ...(filters.drug_type && { type: filters.drug_type }),
      ...(filters.batch_status && { status: filters.batch_status }),
      ...(filters.query && {
        OR: [
          { drug: { name: { contains: filters.query, mode: 'insensitive' } } },
          { drugBrand: { name: { contains: filters.query, mode: 'insensitive' } } },
          { number: { contains: filters.query, mode: 'insensitive' } }
        ]
      })
    }

    // Prepare sorting
    const [sortField, sortDirection] = sort.split(':')
    const orderBy: Prisma.BatchOrderByWithRelationInput =
      sortField === 'expiry' ? { expiry: sortDirection as Prisma.SortOrder } :
        sortField === 'stock_date' ? { stockDate: sortDirection as Prisma.SortOrder } :
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