'use server';

import {revalidatePath} from "next/cache";
import type {myError} from "@/app/lib/definitions";
import {DateRange, InventoryFormData, PatientFormData, StockAnalysis} from "@/app/lib/definitions";
import {prisma} from "./prisma";
import {verifySession} from "./sessions";
import bcrypt from "bcryptjs";
import {BatchStatus, DrugType, Prisma} from "@prisma/client";
import {BrandOption} from "@/app/(dashboard)/patients/[id]/_components/prescribe_components/IssuesList";
import {PrescriptionFormData} from "@/app/(dashboard)/patients/[id]/_components/prescribe_components/PrescriptionForm";

export async function changePassword({currentPassword, newPassword, confirmPassword}: {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
}): Promise<myError> {
    try {
        if (newPassword !== confirmPassword) {
            return {success: false, message: 'Passwords do not match'};
        }

        const session = await verifySession();

        const user = await prisma.user.findUnique({
            where: {id: session.id}
        });

        if (!session || !user) {
            return {success: false, message: 'User not found'};
        }

        if (!bcrypt.compareSync(currentPassword, user.password)) {
            return {success: false, message: 'Current password is incorrect'};
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await prisma.user.update({
            where: {id: session.id},
            data: {password: hashedPassword}
        });

        return {success: true, message: 'Password changed successfully'};

    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while changing password'};
    }
}

// For admin changing nurse passwords
export async function changeUserPassword({
                                             nurseId,
                                             newPassword,
                                             confirmPassword
                                         }: {
    nurseId: number,  // Add nurse ID parameter
    newPassword: string,
    confirmPassword: string
}): Promise<myError> {

    try {
        if (newPassword !== confirmPassword) {
            return {success: false, message: 'Passwords do not match'};
        }

        const session = await verifySession();

        //  Verify admin role
        const admin = await prisma.user.findUnique({
            where: {id: session.id},
            select: {role: true}
        });

        if (admin?.role !== 'DOCTOR') {
            return {success: false, message: 'Unauthorized'};
        }

        // Verify target user exists and is a nurse
        const nurse = await prisma.user.findUnique({
            where: {id: nurseId},
            select: {role: true}
        });

        if (!nurse) {
            return {success: false, message: 'Nurse not found'};
        }

        if (nurse.role !== 'NURSE') {
            return {success: false, message: 'User is not a nurse'};
        }


        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await prisma.user.update({
            where: {id: nurseId},  // Use nurse ID here
            data: {password: hashedPassword}
        });

        return {success: true, message: 'Password changed successfully'};
    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while changing password'}
    }
}

export async function addQueue(): Promise<myError> {
    try {
        const activeQueuesCount = await prisma.queue.count(
            {
                where: {
                    status: 'IN_PROGRESS'
                }
            }
        );

        if (activeQueuesCount !== 0) {
            return {success: false, message: 'There is already an active queue'}
        }

        await prisma.queue.create({
            data: {}
        })
        revalidatePath('/queues')
        return {success: true, message: 'Queue created successfully'}
    } catch (e) {
        console.error(e)
        return {success: false, message: 'An error occurred while creating queue'}
    }
}

export async function getQueues(offset: number, limit: number) {

    return prisma.queue.findMany({
        skip: offset,
        take: limit,
        orderBy: {
            id: 'desc'
        },
        include: {
            _count: {
                select: {entries: true}
            }
        }
    });
}

export async function getQueue(queueId: number) {
    return prisma.queue.findUnique({
        where: {
            id: queueId
        }
    });
}

export async function getTotalQueueCount() {
    return prisma.queue.count();
}

export async function getTotalPages(query = "", filter = "name") {
    const whereClause = query
        ? {
            [filter]: {contains: query},
        }
        : {};

    const totalPatients = await prisma.patient.count({where: whereClause});
    return Math.ceil(totalPatients / PAGE_SIZE);
}

export async function getFilteredPatients(query: string = "", page: number = 1, filter: string = "name") {

    const whereCondition = query
        ? {
            [filter]: {contains: query},
        }
        : {};

    return prisma.patient.findMany({
        where: whereCondition,
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        orderBy: {name: "asc"},
    });
}

const PAGE_SIZE_AVAILABLE_DRUGS_BY_MODEL = 9;
const PAGE_SIZE_AVAILABLE_DRUGS_BY_BRAND = 9;
const PAGE_SIZE_AVAILABLE_DRUGS_BY_BATCH = 6;

// Function to get total pages for filtered drugs by model
export async function getTotalPagesForFilteredDrugsByModel({
    query = "",
    brandId = 0,
}: {
    query?: string;
    brandId?: number;
}) {
    const totalItems = await prisma.drug.count({
        where: {
            name: {
                contains: query,
            },
            batch: {
                some: {
                    status: "AVAILABLE",
                    ...(brandId !== 0 ? { drugBrandId: brandId } : {}),
                },
            },
        },
    });

    return Math.ceil(totalItems / PAGE_SIZE_AVAILABLE_DRUGS_BY_MODEL);
}

// Function to get total pages for filtered drugs by brand
export async function getTotalPagesForFilteredDrugsByBrand({
    query = "",
    modelId = 0,
}: {
    query?: string;
    modelId?: number;
}) {
    if (modelId !== 0) {


        const uniqueBrandCount = await prisma.batch.groupBy({
            by: ['drugBrandId'],
            where: {
                drugId: modelId,
                status: "AVAILABLE",
            },
        });

        return Math.ceil(uniqueBrandCount.length / PAGE_SIZE_AVAILABLE_DRUGS_BY_BRAND);
    }

    const totalItems = await prisma.drugBrand.count({
        where: {
            name: {
                contains: query,
            },
            Batch: {
                some: {
                    status: "AVAILABLE",
                },
            },
        },
    });

    return Math.ceil(totalItems / PAGE_SIZE_AVAILABLE_DRUGS_BY_BRAND);
}

interface whereCondition {
    status: BatchStatus
    number: {
        contains: string;
    };
    drugId?: number;
    drugBrandId?: number;
}

// Function to get total pages for filtered drugs by batch
export async function getTotalPagesForFilteredDrugsByBatch({
    query = "",
    modelId = 0,
    brandId = 0,
}: {
    query?: string;
    modelId?: number;
    brandId?: number;
}) {
    const whereCondition: whereCondition = {
        status: "AVAILABLE",
        number: {
            contains: query,
        },
    };

    if (modelId !== 0) whereCondition.drugId = Number(modelId);
    if (brandId !== 0) whereCondition.drugBrandId = Number(brandId);

    const totalItems = await prisma.batch.count({
        where: whereCondition,
    });

    return Math.ceil(totalItems / PAGE_SIZE_AVAILABLE_DRUGS_BY_BATCH);
}

export async function getFilteredDrugsByModel({
    query = "",
    page = 1,
    sort = "alphabetically",
    brandId = 0
}: {
    query?: string;
    page?: number;
    sort?: string;
    brandId?: number;
}) {
    const drugs = await prisma.drug.findMany({
        where: {
            name: {
                contains: query,
            },
            batch: {
                some: {
                    status: "AVAILABLE",
                    ...(brandId !== 0 ? { drugBrandId: brandId } : {}), // Filter by brandId if it's not 0
                },
            },
        },
        include: {
            batch: {
                where: {
                    status: "AVAILABLE",
                    ...(brandId !== 0 ? { drugBrandId: brandId } : {}), // Apply brandId filter
                },
                select: {
                    remainingQuantity: true,
                    drugBrand: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
        },
    });

    // Filter out drugs with no available batches and aggregate remaining quantity
    const aggregatedDrugs = drugs
        .filter((drug) => drug.batch.length > 0)
        .map((drug) => {
            const uniqueBrandIds = new Set(drug.batch.map((batch) => batch.drugBrand.id));

            return {
                id: drug.id,
                name: drug.name,
                totalRemainingQuantity: drug.batch.reduce(
                    (sum, batch) => sum + batch.remainingQuantity,
                    0
                ),
                brandCount: uniqueBrandIds.size, // Count unique brands associated with batches
            };
        });

    // Sorting logic
    if (sort === "lowest") {
        aggregatedDrugs.sort((a, b) => a.totalRemainingQuantity - b.totalRemainingQuantity);
    } else if (sort === "highest") {
        aggregatedDrugs.sort((a, b) => b.totalRemainingQuantity - a.totalRemainingQuantity);
    } else if (sort === "alphabetically") {
        aggregatedDrugs.sort((a, b) => a.name.localeCompare(b.name));
    }

    return aggregatedDrugs.slice(
        (page - 1) * PAGE_SIZE_AVAILABLE_DRUGS_BY_MODEL,
        page * PAGE_SIZE_AVAILABLE_DRUGS_BY_MODEL
    );
}


export async function getFilteredDrugsByBrand({
    query = "",
    page = 1,
    sort = "alphabetically",
    modelId = 0
}: {
    query?: string;
    page?: number;
    sort?: string;
    modelId?: number;
}) {
    if (modelId !== 0) {
        // Fetch all brands associated with the specified model
        const batches = await prisma.batch.findMany({
            where: {
                drugId: modelId,
                status: "AVAILABLE",
            },
            include: {
                drugBrand: true,
            },
        });

        const uniqueBrands = new Map();

        batches.forEach(batch => {
            uniqueBrands.set(batch.drugBrand.id, {
                id: batch.drugBrand.id,
                name: batch.drugBrand.name,
                modelCount: 1, // Since it's a specific model
            });
        });

        return Array.from(uniqueBrands.values());
    }

    // Base query conditions
    const brandWhereCondition = {
        name: {
            contains: query,
        },
    };

    // Fetch all drug brands with available batches
    const brands = await prisma.drugBrand.findMany({
        where: brandWhereCondition,
        include: {
            Batch: {
                where: {
                    status: "AVAILABLE",
                },
                include: {
                    drug: true,
                },
            },
        },
    });

    // Aggregate brands with available models
    const aggregatedBrands = brands
        .map((brand) => ({
            id: brand.id,
            name: brand.name,
            modelCount: new Set(brand.Batch.map((batch) => batch.drug.id)).size, // Count unique drug models
        }))
        .filter((brand) => brand.modelCount > 0);

    // Sorting logic
    if (sort === "lowest") {
        aggregatedBrands.sort((a, b) => a.modelCount - b.modelCount);
    } else if (sort === "highest") {
        aggregatedBrands.sort((a, b) => b.modelCount - a.modelCount);
    } else if (sort === "alphabetically") {
        aggregatedBrands.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Pagination
    return aggregatedBrands.slice(
        (page - 1) * PAGE_SIZE_AVAILABLE_DRUGS_BY_BRAND,
        page * PAGE_SIZE_AVAILABLE_DRUGS_BY_BRAND
    );
}


export async function getFilteredDrugsByBatch({
    query = "",
    page = 1,
    sort = "expiryDate",
    modelId = 0,
    brandId = 0
}: {
    query?: string;
    page?: number;
    sort?: string;
    modelId?: number;
    brandId?: number;
}) {
    // Base where condition
    const whereCondition: whereCondition = {
        status: "AVAILABLE",
        number: {
            contains: query, // Search by batch number
        },
    };

    // Apply modelId and brandId filters if provided
    if (modelId !== 0) whereCondition.drugId = Number(modelId);
    if (brandId !== 0) whereCondition.drugBrandId = Number(brandId);

    const batches = await prisma.batch.findMany({
        where: whereCondition,
        include: {
            drug: true,
            drugBrand: true,
        },
    });

    const formattedBatches = batches.map((batch) => ({
        id: batch.id,
        batchNumber: batch.number,
        brandName: batch.drugBrand.name,
        modelName: batch.drug.name,
        expiryDate: batch.expiry.toISOString(),
        stockDate: batch.stockDate.toISOString(),
        remainingAmount: batch.remainingQuantity,
        fullAmount: batch.fullAmount,
    }));

    // Sorting logic
    if (sort === "expiryDate") {
        formattedBatches.sort(
            (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );
    } else if (sort === "newlyAdded") {
        formattedBatches.sort(
            (a, b) => new Date(b.stockDate).getTime() - new Date(a.stockDate).getTime()
        );
    } else if (sort === "alphabetically") {
        formattedBatches.sort((a, b) => a.modelName.localeCompare(b.modelName));
    }

    // Pagination logic
    return formattedBatches.slice(
        (page - 1) * PAGE_SIZE_AVAILABLE_DRUGS_BY_BATCH,
        page * PAGE_SIZE_AVAILABLE_DRUGS_BY_BATCH
    );
}





export async function stopQueue(id: string | null): Promise<myError> {
    try {

        if (!id) {
            return {success: false, message: 'Queue ID not provided'}
        }

        const numberId = parseInt(id)

        const queue = await prisma.queue.findUnique(
            {
                where: {
                    id: numberId
                }
            }
        )

        if (!queue) {
            return {success: false, message: 'Queue not found'}
        }

        if (queue.status === 'COMPLETED') {
            return {success: false, message: 'Queue is already stopped'}
        }

        const UncompletedQueueEntries = await prisma.queueEntry.findMany({
            where: {
                queueId: numberId,
                status: {
                    not: 'COMPLETED'
                }
            }
        })

        if (UncompletedQueueEntries.length > 0) {
            return {success: false, message: 'Queue has uncompleted entries'}
        }

        await prisma.queue.update({
            where: {
                id: numberId
            },
            data: {
                status: 'COMPLETED'
            }
        })
        return {success: true, message: 'Queue stopped successfully'}
    } catch (e) {
        console.error(e)
        return {success: false, message: 'An error occurred while stopping queue'}
    }
}

export async function getQueueStatus(id: number) {
    return prisma.queue.findUnique({
        where: {
            id
        },
        select: {
            status: true
        }
    });
}

export async function getQueueStatusesCount(id: number) {
    try {
        const result = await prisma.queueEntry.groupBy({
            by: ['status'],
            where: {
                queueId: id
            },
            _count: {
                status: true
            }
        })

        const statuses = {
            PENDING: 0,
            PRESCRIBED: 0,
            COMPLETED: 0
        }

        result.forEach((item) => {
            statuses[item.status] = item._count.status
        })

        return statuses;
    } catch (e) {
        console.error(e);
        throw new Error('An error occurred while getting queue statuses count')
    }
}

export async function queuePatients(id: number) {
    try {
        return await prisma.queueEntry.findMany({
            where: {
                queueId: id
            },
            include: {
                patient: true,
                queue: true
            },
            orderBy: {
                token: 'asc'
            }
        });
    } catch (e) {
        console.error(e);
        throw new Error('An error occurred while getting queue patients')
    }
}

export async function removePatientFromQueue(queueId: number, token: number): Promise<myError> {
    try {
        await prisma.queueEntry.delete({
            where: {
                queueId_token: {
                    queueId,
                    token
                }
            }
        });

        revalidatePath(`/queue/${queueId}`);
        return {success: true, message: 'Patient removed successfully'}
    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while removing patient from queue'}
    }
}

export async function searchPatients(query: string, searchBy: "name" | "telephone" | "NIC") {
    if (!query) return [];

    return prisma.patient.findMany({
        where: {
            [searchBy]: {
                contains: query
            },
        },
        take: 10, // Limit results
    });
}

export async function addPatientToQueue(queueId: number, patientId: number): Promise<myError> {

    try {
        const queue = await prisma.queue.findUnique({
            where: {
                id: queueId
            }
        });

        if (!queue) {
            return {success: false, message: 'Queue not found'}
        }

        const patient = await prisma.patient.findUnique({
            where: {
                id: patientId
            }
        });

        if (!patient) {
            return {success: false, message: 'Patient not found'}
        }

        if (queue.status === 'COMPLETED') {
            return {success: false, message: 'Queue is stopped'}
        }

        const lastToken = await prisma.queueEntry.findFirst({
            where: {
                queueId
            },
            orderBy: {
                token: 'desc'
            }
        });

        const token = lastToken ? lastToken.token + 1 : 1;

        await prisma.queueEntry.create({
            data: {
                queueId,
                patientId,
                token
            }
        });

        revalidatePath(`/queue/${queueId}`);
        return {success: true, message: 'Patient added to queue successfully'}
    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while adding patient to queue'}
    }
}

export async function getActiveQueue() {
    return prisma.queue.findFirst({
        where: {
            status: 'IN_PROGRESS'
        }
    });
}

export async function getPatientDetails(id: number) {
    return prisma.patient.findUnique({
        where: {
            id
        }
    });
}

export async function getFilteredReports(query: string) {
    return prisma.reportType.findMany({
        where: {
            name: {
                contains: query
            }
        },
        orderBy: { id: "asc" },
        include: {
            parameters: true
        }
    });
}

export async function getTotalReportTemplateCount() {
    return prisma.reportType.count();
}

export async function addReportType(reportForm: ReportForm): Promise<myError> {
    try {
        if (reportForm.parameters.length === 0) {
            return {success: false, message: 'At least one parameter is required'};
        }

        console.log(reportForm.parameters);

        await prisma.reportType.create({
            data: {
                name: reportForm.name,
                description: reportForm.description,
                parameters: {
                    create: reportForm.parameters,
                },
            },
        });

        revalidatePath('/reports');
        return {success: true, message: 'Report type added successfully'};
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                return {success: false, message: 'Report type name must be unique'};
            }
            if (e.code === 'P2003') {
                return {success: false, message: 'Invalid parameter reference (foreign key constraint failed)'};
            }
        }
        console.error(e);

        return {success: false, message: 'An unexpected error occurred while adding report type'};
    }
}


export async function getReportType(reportId: number) {
    return prisma.reportType.findUnique({
        where: {
            id: reportId
        },
        include: {
            parameters: true
        }
    });
}

interface Parameter {
    name: string;
    units: string;
    id?: number;
    isNew?: boolean;
}

interface ReportForm {
    name: string;
    description: string;
    parameters: Parameter[];
}


export async function editReportType(reportForm: ReportForm, reportId: number): Promise<myError> {
    try {
        console.log(reportForm);

        return await prisma.$transaction(async (tx) => {
            const report = await tx.reportType.findUnique({
                where: { id: reportId },
                include: { parameters: true }
            });

            if (!report) {
                throw new Error('Report type not found');
            }

            const newParams = reportForm.parameters.filter((param) => param.isNew);
            const oldParams = reportForm.parameters.filter((param) => !param.isNew);

            for (const params of report.parameters) {
                if (newParams.find((param) => param.name === params.name)) {
                    throw new Error('Cannot add an existing parameter. Do not remove and add the same parameter.');
                }
            }

            // Delete removed parameters
            const deletedParams = report.parameters.filter((param) => !oldParams.find((p) => p.id === param.id));

            for (const param of deletedParams) {
                const reportValues = await tx.reportValue.findMany({
                    where: { reportParameterId: param.id }
                });

                if (reportValues.length > 0) {
                    throw new Error(`Cannot delete parameter ${param.name} as it is in use`);
                }

                await tx.reportParameter.delete({
                    where: { id: param.id }
                });
            }

            // Update existing parameters
            for (const param of oldParams) {
                await tx.reportParameter.update({
                    where: { id: param.id },
                    data: {
                        name: param.name,
                        units: param.units
                    }
                });
            }

            // Add new parameters
            for (const param of newParams) {
                await tx.reportParameter.create({
                    data: {
                        name: param.name,
                        units: param.units,
                        reportTypeId: reportId
                    }
                });
            }

            // Update the report type itself
            await tx.reportType.update({
                where: { id: reportId },
                data: {
                    name: reportForm.name,
                    description: reportForm.description
                }
            });

            revalidatePath('/admin/reports');
            return { success: true, message: 'Report type updated successfully' };
        });
    } catch (e) {
        if (e instanceof Error) {
            return {
                success: false,
                message: e.message
            };
        }
        return {
            success: false,
            message: 'An uncaught error occurred while updating report type'
        };
    }
}


export const deleteReportType = async (reportId: number): Promise<myError> => {
    try {
        await prisma.reportType.delete({
            where: {
                id: reportId
            }
        });
        revalidatePath('/admin/reports');
        return {success: true, message: 'Report type deleted successfully'}
    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while deleting report type'}
    }
}


export async function addPatient({formData}: { formData: PatientFormData }): Promise<myError> {
    try {
        const floatHeight = parseFloat(formData.height);

        const floatWeight = parseFloat(formData.weight);

        if (formData.gender === "") {
            return {success: false, message: 'Select a valid Gender'};
        }

        if (!formData.name || !formData.telephone) {
            return {success: false, message: 'Please fill all fields'};
        }

        if (formData.telephone.length !== 10) {
            return { success: false, message: 'Invalid telephone number' };
        }

        const date = new Date(formData.birthDate);

        if (isNaN(date.getTime())) {
            return {success: false, message: 'Invalid birth date'};
        }

        await prisma.patient.create({
            data: {
                name: formData.name,
                NIC: formData.NIC,
                telephone: formData.telephone,
                birthDate: date,
                address: formData.address,
                height: floatHeight,
                weight: floatWeight,
                gender: formData.gender
            }
        });

        revalidatePath('/patients');
        return {success: true, message: 'Patient added successfully'};
    }
    catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while adding patient'};
    }
}

export async function updatePatient(formData: PatientFormData, id: number): Promise<myError> {
    try {
        const floatHeight = parseFloat(formData.height);
        const floatWeight = parseFloat(formData.weight);

        if (formData.gender === "") {
            return {success: false, message: 'Select a valid Gender'};
        }

        if (!formData.name || !formData.telephone) {
            return {success: false, message: 'Please fill all fields'};
        }

        const date = new Date(formData.birthDate);

        if (isNaN(date.getTime())) {
            return {success: false, message: 'Invalid birth date'};
        }

        await prisma.patient.update({
            where: {id},
            data: {
                name: formData.name,
                NIC: formData.NIC,
                telephone: formData.telephone,
                birthDate: date,
                address: formData.address,
                height: floatHeight,
                weight: floatWeight,
                gender: formData.gender,
            }
        });


        revalidatePath(`/patients/${id}`);
        return {success: true, message: 'Patient updated successfully'};
    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while updating patient'};
    }
}

//For adding drugs to the inventory
export async function addNewItem(
    { formData }: {
        formData: InventoryFormData
    }): Promise<myError> {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Create or connect drug brand
            const brand = await tx.drugBrand.upsert({
                where: { id: formData.brandId ?? 0},
                update: {},
                create: {
                    name: formData.brandName,
                    description: formData.brandDescription || null
                }
            });

            // 2. Create or connect drug
            const drug = await tx.drug.upsert({
                where: { id: formData.drugId ?? 0},
                update: {},
                create: {
                    name: formData.drugName

                }
            });

            // 3. Create batch with both drug and brand relationships
            await tx.batch.create({
                data: {
                    number: formData.batchNumber,
                    drug: {
                        connect: { id: drug.id }
                    },
                    drugBrand: {
                        connect: { id: brand.id }
                    },
                    type: formData.drugType as DrugType,
                    fullAmount: parseFloat(formData.quantity.toString()),
                    remainingQuantity: parseFloat(formData.quantity.toString()),
                    expiry: new Date(formData.expiry),
                    price: parseFloat(formData.price.toString()),
                    status: 'AVAILABLE'
                }
            });

            revalidatePath('/inventory/available-stocks');
            return { success: true, message: 'Item added successfully' };
        });
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to add item' };
    }
}

export async function getDrugBrands() {
    return prisma.drugBrand.findMany({
        select: { name: true },
        orderBy: { name: 'asc' }
    });
}

export async function getBatchData(batchId: number) {
    try {
        const batchData = await prisma.batch.findUnique({
            where: {
                id: batchId,
            },
            include: {
                drug: {
                    select: {
                        name: true,
                    },
                },
                drugBrand: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!batchData) {
            throw new Error('Batch not found');
        }

        return {
            number: batchData.number,
            drugName: batchData.drug.name,
            drugBrandName: batchData.drugBrand.name,
            drugType: batchData.type,
            fullAmount: batchData.fullAmount,
            remainingQuantity: batchData.remainingQuantity,
            expiryDate: batchData.expiry.toISOString().split('T')[0], // Format to 'YYYY-MM-DD'
            stockDate: batchData.stockDate.toISOString().split('T')[0], // Format to 'YYYY-MM-DD'
            price: batchData.price,
            status: batchData.status,
        };
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

export async function handleConfirmationOfBatchStatusChange(batchId: number, action: "completed" | "trashed"): Promise<void> {
    if (!batchId) return;

    const newStatus = action === "completed" ? "COMPLETED" : "TRASHED";

    try {
        await prisma.batch.update({
            where: { id: batchId },
            data: { status: newStatus },
        });

        console.log(`Batch ${batchId} updated to ${newStatus}.`);
    } catch (error) {
        console.error("Error updating batch status:", error);
    }
};

// Fetch functions for brand, drug, and batch data
export async function getBrandName(id: number): Promise<string> {
    try {
      const brand = await prisma.drugBrand.findUnique({
        where: { id },
        select: { name: true }
      });
      return brand?.name || `Brand-${id}`;
    } catch (error) {
      console.error('Error fetching brand name:', error);
      return `Brand-${id}`;
    }
  }

  export async function getDrugName(id: number): Promise<string> {
    try {
      const drug = await prisma.drug.findUnique({
        where: { id },
        select: { name: true }
      });
      return drug?.name || `Drug-${id}`;
    } catch (error) {
      console.error('Error fetching drug name:', error);
      return `Drug-${id}`;
    }
  }

  export async function getBatchNumber(id: number): Promise<string> {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id },
        select: { number: true }
      });
      return batch?.number || `Batch-${id}`;
    } catch (error) {
      console.error('Error fetching batch number:', error);
      return `Batch-${id}`;
    }
  }
export async function getPatientReportPages(query: string, range: string, id: number) {
    let dateFilter = {};

    if (range !== "ALL") {
        const months = parseInt(range.replace("M", ""), 10);
        const fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - months);

        dateFilter = {time: {gte: fromDate}};
    }

    return prisma.patientReport.count({
        where: {
            patientId: id,
            reportType: {
                name: {contains: query},
            },
            ...dateFilter,
        },
    });
}

export async function getPatientReports(query: string, range: string, PatientId: number, page: number) {
    try {
        let dateFilter = {};

        if (range !== "ALL") {
            const months = parseInt(range.replace("M", ""), 10);
            const fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - months);

            dateFilter = {time: {gte: fromDate}};
        }

        return prisma.patientReport.findMany({
            where: {
                patientId: PatientId,
                reportType: {
                    name: {contains: query},
                },
                ...dateFilter,
            },
            take: PAGE_SIZE,
            skip: (page - 1) * PAGE_SIZE,
            orderBy: {time: "desc"},
            include: {
                reportType: true,
                parameters: {
                    select: {
                        value: true,
                        attention: true,
                        reportParameter: {
                            select: {
                                name: true,
                                units: true,
                            },
                        },
                    }
                }
            },
        });
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getAllReportCount(id: number) {
    return prisma.patientReport.count({
        where: {
            patientId: id
        }
    });
}

export const searchReportTypes = async (query: string) => {
    return prisma.reportType.findMany({
        where: {
            name: {
                startsWith: query
            }
        },
        select: {
            name: true,
            id: true
        },
        take: 10
    });
}

export const getReportParams = async (id: number) => {
    return prisma.reportParameter.findMany({
        where: {
            reportTypeId: id
        },
        select: {
            id: true,
            name: true,
            units: true,
        }
    });
}

export async function addPatientReport({patientID, reportTypeID, params}: {
    patientID: number,
    reportTypeID: number,
    params: Record<number, { value: string, attention: boolean }>
}): Promise<myError> {
    try {
        const reportType = await prisma.reportType.findUnique({
            where: {id: reportTypeID}
        });

        if (!reportType) {
            return {success: false, message: 'Report type not found'};
        }

        // check if all params have empty values
        if (Object.values(params).every((param) => param.value === '')) {
            return {success: false, message: 'Please fill at least one parameter'};
        }

        await prisma.patientReport.create({
            data: {
                patientId: patientID,
                reportTypeId: reportTypeID,
                parameters: {
                    create: Object.entries(params).map(([key, param]) => ({
                        reportParameterId: parseInt(key, 10),
                        value: param.value,
                        attention: param.attention
                    }))
                }
            }
        });

        revalidatePath(`/patients/${patientID}/reports`);
        return {success: true, message: 'Report added successfully'};
    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while adding report'};
    }
}

export async function deletePatientReport(reportId: number, patientID: number): Promise<myError> {
    try {
        await prisma.patientReport.delete({
            where: {
                id: reportId
            }
        });

        revalidatePath(`/patients/${patientID}/reports`);
        return {success: true, message: 'Report deleted successfully'};
    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while deleting report'};
    }
}

export async function getPendingPatientsCount() {
    return prisma.queueEntry.count({
        where: {
            status: 'PENDING'
        }
    });
}



const PAGE_SIZE = 10;

// Type definitions
type SortOption = "alphabetically" | "highest" | "lowest" | "unit-highest" | "unit-lowest";

interface StockQueryParams {
    query?: string;
    page?: number;
    sort?: SortOption;
}

interface StockData {
    id: number;
    name: string;
    totalPrice: number;
    unitPrice?: number;
    remainingQuantity?: number;
}

// Helper function to apply sorting
function applySorting(data: StockData[], sort: SortOption = "alphabetically"): StockData[] {
    switch (sort) {
        case "alphabetically":
            return data.sort((a, b) => a.name.localeCompare(b.name));
        case "highest":
            return data.sort((a, b) => b.totalPrice - a.totalPrice);
        case "lowest":
            return data.sort((a, b) => a.totalPrice - b.totalPrice);
        case "unit-highest":
            return data.sort((a, b) => {
                const aUnit = a.unitPrice || 0;
                const bUnit = b.unitPrice || 0;
                return bUnit - aUnit;
            });
        case "unit-lowest":
            return data.sort((a, b) => {
                const aUnit = a.unitPrice || 0;
                const bUnit = b.unitPrice || 0;
                return aUnit - bUnit;
            });
        default:
            return data;
    }
}

// Get total pages for pagination
export async function getAvailableDrugsTotalPages(query: string, selection: string): Promise<number> {
    let count = 0;

    switch (selection) {
        case "brand":
            count = await prisma.drugBrand.count({
                where: {
                    name: { contains: query },
                    Batch: { some: { status: "AVAILABLE" } },
                },
            });
            break;
        case "model":
            count = await prisma.drug.count({
                where: {
                    name: { contains: query },
                    batch: { some: { status: "AVAILABLE" } },
                },
            });
            break;
        case "batch":
            count = await prisma.batch.count({
                where: {
                    OR: [
                        { drug: { name: { contains: query } } },
                        { drugBrand: { name: { contains: query } } },
                    ],
                    status: "AVAILABLE",
                },
            });
            break;
    }

    return Math.ceil(count / PAGE_SIZE);
}

// Fetch stock grouped by brand
export async function getStockByBrand({
    query = "",
    page = 1,
    sort = "alphabetically"
}: StockQueryParams): Promise<StockData[]> {
    const brands = await prisma.drugBrand.findMany({
        where: {
            name: { contains: query },
            Batch: { some: { status: "AVAILABLE" } },
        },
        include: {
            Batch: {
                where: { status: "AVAILABLE" },
                select: {
                    price: true,
                    remainingQuantity: true,
                },
            },
        },
    });

    const stockData: StockData[] = brands.map(brand => ({
        id: brand.id,
        name: brand.name,
        totalPrice: brand.Batch.reduce(
            (sum, batch) => sum + batch.price * batch.remainingQuantity,
            0
        ),
    }));

    const sortedData = applySorting(stockData, sort as SortOption);
    return sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

// Fetch stock grouped by model
export async function getStockByModel({
    query = "",
    page = 1,
    sort = "alphabetically"
}: StockQueryParams): Promise<StockData[]> {
    const drugs = await prisma.drug.findMany({
        where: {
            name: { contains: query },
            batch: { some: { status: "AVAILABLE" } },
        },
        include: {
            batch: {
                where: { status: "AVAILABLE" },
                select: {
                    price: true,
                    remainingQuantity: true,
                },
            },
        },
    });

    const stockData: StockData[] = drugs.map(drug => ({
        id: drug.id,
        name: drug.name,
        totalPrice: drug.batch.reduce(
            (sum, batch) => sum + batch.price * batch.remainingQuantity,
            0
        ),
    }));

    const sortedData = applySorting(stockData, sort as SortOption);
    return sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

// Fetch stock grouped by batch
export async function getStockByBatch({
    query = "",
    page = 1,
    sort = "alphabetically"
}: StockQueryParams): Promise<StockData[]> {
    const batches = await prisma.batch.findMany({
        where: {
            OR: [
                { drug: { name: { contains: query } } },
                { drugBrand: { name: { contains: query } } },
            ],
            status: "AVAILABLE",
        },
        include: {
            drug: true,
            drugBrand: true,
        },
    });

    const stockData: StockData[] = batches.map(batch => ({
        id: batch.id,
        name: `${batch.drugBrand.name} - ${batch.drug.name} (Batch ${batch.number})`,
        totalPrice: batch.price * batch.remainingQuantity,
        unitPrice: batch.price,
        remainingQuantity: batch.remainingQuantity,
    }));

    const sortedData = applySorting(stockData, sort as SortOption);
    return sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

export async function getStockAnalysis(dateRange: DateRange): Promise<StockAnalysis> {
  try {
    const batches = await prisma.batch.findMany({
      where: {
        stockDate: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      include: {
        Issue: true,
      },
    });

    const analysis: StockAnalysis = {
      available: 0,
      sold: 0,
      expired: 0,
      trashed: 0,
      errors: 0,
    };

    batches.forEach((batch) => {
      const soldQuantity = batch.fullAmount - batch.remainingQuantity;
      const pricePerUnit = batch.price;

      // Calculate values based on price
      const remainingValue = batch.remainingQuantity * pricePerUnit;
      const soldValue = soldQuantity * pricePerUnit;

      switch (batch.status) {
        case "AVAILABLE":
          analysis.available += remainingValue;
          analysis.sold += soldValue;
          break;
        case "EXPIRED":
          analysis.expired += remainingValue;
          analysis.sold += soldValue;
          break;
        case "COMPLETED":
          analysis.sold += batch.fullAmount * pricePerUnit;
          break;
        case "TRASHED":
          analysis.trashed += remainingValue;
          analysis.sold += soldValue;
          break;
        default:
          analysis.errors += batch.fullAmount * pricePerUnit;
      }
    });

    return analysis;
  } catch (error) {
    console.error("Error fetching stock analysis:", error);
    throw new Error("Failed to fetch stock analysis");
  }
}

export async function searchAvailableDrugs(term: string) {
    return prisma.drug.findMany({
        where: {
            name: {
                startsWith: term
            },
            batch: {
                some: {
                    status: "AVAILABLE"
                }
            }
        },
        take: 10,
        select: {
            id: true,
            name: true,
            _count: {
                select: {
                    batch: true // Counts the number of related batches
                }
            },
            batch: {
                distinct: ["drugBrandId"], // Get unique brands from batches
                select: {
                    drugBrandId: true
                }
            }
        }
    }).then((drugs) =>
        drugs.map((drug) => ({
            id: drug.id,
            name: drug.name,
            brandCount: drug.batch.length // Count unique brands
        }))
    );
}


export async function searchBrandByDrug({drugID}: {
    drugID: number;
}): Promise<BrandOption[]> {
    return prisma.drugBrand.findMany({
        where: {
            Batch: {
                some: {
                    status: "AVAILABLE",
                    drugId: drugID
                }
            }
        },
        select: {
            id: true,
            name: true,
            Batch: {
                where: {
                    status: "AVAILABLE",
                    drugId: drugID
                },
                select: {
                    remainingQuantity: true,
                    expiry: true
                }
            }
        }
    }).then((brands) =>
        brands.map((brand) => {
            const batchCount = brand.Batch.length;
            const totalRemainingQuantity = brand.Batch.reduce(
                (sum, batch) => sum + batch.remainingQuantity, 0
            );
            const farthestExpiry = brand.Batch.reduce(
                (maxDate, batch) => (batch.expiry > maxDate ? batch.expiry : maxDate),
                new Date(0) // Initialize with the oldest possible date
            );
            return {
                id: brand.id,
                name: brand.name,
                batchCount,
                totalRemainingQuantity,
                farthestExpiry
            };
        })
    );
}


export async function addPrescription({
                                          prescriptionForm,
                                          patientID
                                      }: {
    prescriptionForm: PrescriptionFormData;
    patientID: number;
}): Promise<myError> {
    try {
        // Basic validation checks
        if (prescriptionForm.issues.length === 0 && prescriptionForm.offRecordMeds.length === 0) {
            return {success: false, message: 'At least one prescription is required'};
        }

        // Create prescription with all related records in a transaction
        await prisma.$transaction(async (tx) => {
            // Create the main prescription and store its result to get issue IDs
            const prescription = await tx.prescription.create({
                data: {
                    patientId: patientID,
                    presentingSymptoms: prescriptionForm.presentingSymptoms,
                    bloodPressure: prescriptionForm.bloodPressure,
                    pulse: prescriptionForm.pulse,
                    cardiovascular: prescriptionForm.cardiovascular,
                    // Create issues
                    issues: {
                        create: prescriptionForm.issues.map(issue => ({
                            drugId: issue.drugId,
                            brandId: issue.brandId,
                            strategy: issue.strategy,
                            strategyDetails: issue.strategyDetails,
                            quantity: issue.quantity
                        }))
                    },
                    // Create off-record medications
                    OffRecordMeds: {
                        create: prescriptionForm.offRecordMeds.map(med => ({
                            name: med.name,
                            description: med.description
                        }))
                    }
                },
                // Include the created issues in the return value
                include: {
                    issues: true
                }
            });

            // Update strategy history for each issue
            for (let i = 0; i < prescriptionForm.issues.length; i++) {
                const issue = prescriptionForm.issues[i];
                const createdIssue = prescription.issues[i]; // Get the corresponding created issue

                // Try to find existing history
                const existingHistory = await tx.stratergyHistory.findUnique({
                    where: {
                        drugId: issue.drugId
                    }
                });

                if (existingHistory) {
                    // Update existing history with new brand and issue
                    await tx.stratergyHistory.update({
                        where: {
                            drugId: issue.drugId
                        },
                        data: {
                            brandId: issue.brandId,
                            issueId: createdIssue.id
                        }
                    });
                } else {
                    // Create new history entry
                    await tx.stratergyHistory.create({
                        data: {
                            drugId: issue.drugId,
                            brandId: issue.brandId,
                            issueId: createdIssue.id
                        }
                    });
                }
            }
        });

        return {
            success: true,
            message: 'Prescription created successfully'
        };
    } catch (e) {
        console.error('Error adding prescription:', e);
        return {
            success: false,
            message: e instanceof Error ? e.message : 'An error occurred while adding prescription'
        };
    }
}

export async function getCachedStrategy(drugID: number) {
    return prisma.stratergyHistory.findUnique({
        where: {
            drugId: drugID
        },
        select: {
            issueId: true,
            brandId: true,
            issue: true
        }
    });
}