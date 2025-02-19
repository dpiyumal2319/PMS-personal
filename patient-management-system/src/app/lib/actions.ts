'use server';

import {revalidatePath} from "next/cache";
import {
    Bill,
    DateRange,
    InventoryFormData,
    myBillError,
    myError,
    PatientFormData,
    SortOption,
    StockAnalysis,
    StockData,
    StockQueryParams,
} from "@/app/lib/definitions";
import {prisma} from "./prisma";
import {verifySession} from "./sessions";
import bcrypt from "bcryptjs";
import {$Enums, BatchStatus, DrugType, Prisma, Role} from "@prisma/client";
import {PrescriptionFormData} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";
import {BrandOption} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/IssueFromInventory";
import {
    BatchAssignPayload
} from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/BatchAssign";
import {ChangePasswordFormData} from "@/app/(dashboard)/admin/_components/ChangePasswordDialog";
import {EditUserProfileFormData} from "@/app/(dashboard)/admin/_components/EditProfileDialog";
import {validateEmail, validateMobile} from "@/app/lib/utils";
import {AddUserFormData} from "@/app/(dashboard)/admin/staff/_components/AddUserDialog";
import ChargeType = $Enums.ChargeType;
import {SearchType} from "@/app/(dashboard)/queue/[id]/_components/CustomSearchSelect";

export async function changePassword({
                                         currentPassword,
                                         newPassword,
                                         confirmPassword,
                                         userID
                                     }: ChangePasswordFormData): Promise<myError> {
    try {
        if (newPassword !== confirmPassword) {
            return {success: false, message: "Passwords do not match"};
        }

        const session = await verifySession(); // Get current user session

        // Fetch target user
        const user = await prisma.user.findUnique({
            where: {id: userID}
        });

        if (!user) {
            return {success: false, message: "User not found"};
        }

        // Doctor (Super User) - can change anyone’s password without providing current password
        if (session.role === Role.DOCTOR) {
            // Check if the doctor is changing their own password
            if (session.id === userID) {
                // Doctor changing own password, requires currentPassword
                if (!bcrypt.compareSync(currentPassword, user.password)) {
                    return {success: false, message: "Current password is incorrect"};
                }
            }
        } else {
            // Non-doctors can only change their own password and must provide current password
            if (session.id !== userID) {
                return {success: false, message: "You do not have permission to change this user's password"};
            }
            if (!bcrypt.compareSync(currentPassword, user.password)) {
                return {success: false, message: "Current password is incorrect"};
            }
        }

        // Hash and update password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await prisma.user.update({
            where: {id: userID},
            data: {password: hashedPassword}
        });

        return {success: true, message: "Password changed successfully"};
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        return {success: false, message: "An error occurred while changing password"};
    }
}

export async function getUser(id: number) {
    const session = await verifySession();

    if (session.role !== Role.DOCTOR && session.id !== id) {
        throw new Error('You do not have permission to view this user');
    }

    return prisma.user.findUnique({
        where: {id},
        select: {
            name: true,
            email: true,
            mobile: true,
            role: true,
            image: true,
            gender: true
        }
    });
}

export async function deleteUser(id: number): Promise<myError> {
    try {
        const session = await verifySession();

        if (session.id === id) {
            return {success: false, message: "You cannot delete your own account"};
        }

        if (session.role !== Role.DOCTOR) {
            return {success: false, message: "You do not have permission to delete users"};
        }

        await prisma.user.delete({
            where: {id}
        });

        revalidatePath("/admin/staff");
        revalidatePath("/admin/profile");
        return {success: true, message: "User deleted successfully"};
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        return {success: false, message: "An error occurred while deleting user"};
    }
}

export async function editProfile(formData: EditUserProfileFormData) {
    try {
        if (!formData.name || !formData.email || !formData.telephone || !formData.gender) {
            return {success: false, message: 'Please fill all fields'};
        }

        if (validateEmail(formData.email)) {
            return {success: false, message: 'Invalid email address'};
        }

        if (validateMobile(formData.telephone)) {
            return {success: false, message: 'Invalid telephone number'};
        }

        const session = await verifySession();

        if (!(session.role === Role.DOCTOR)) {
            if (session.id !== formData.id) {
                return {success: false, message: 'You do not have permission to edit this profile'};
            }
        }

        await prisma.user.update({
            where: {id: formData.id},
            data: {
                name: formData.name,
                email: formData.email,
                mobile: formData.telephone,
                image: formData.image,
                gender: formData.gender
            }
        })

        revalidatePath('/admin/staff');
        revalidatePath('/admin/profile');

        if (session.id === formData.id) {
            revalidatePath('/')
        }

        return {success: true, message: 'Profile updated successfully'};
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        return {success: false, message: 'An error occurred while updating profile'};
    }
}

export async function addUser({formData}: { formData: AddUserFormData }): Promise<myError> {
    try {
        if (!formData.name || !formData.email || !formData.telephone || !formData.gender) {
            return {success: false, message: 'Please fill all fields'};
        }

        if (validateEmail(formData.email)) {
            return {success: false, message: 'Invalid email address'};
        }

        if (validateMobile(formData.telephone)) {
            return {success: false, message: 'Invalid telephone number'};
        }

        if (!formData.password) {
            return {success: false, message: 'Password is required'};
        }

        if (formData.password.length < 8) {
            return {success: false, message: 'Password must be at least 8 characters'};
        }

        if (!(formData.password === formData.confirmPassword)) {
            return {success: false, message: 'Passwords do not match'};
        }

        const session = await verifySession();

        if (session.role !== Role.DOCTOR) {
            return {success: false, message: 'You do not have permission to add staff'};
        }

        const hashedPassword = bcrypt.hashSync(formData.password, 10);

        await prisma.user.create({
            data: {
                name: formData.name,
                gender: formData.gender,
                role: Role.NURSE,
                email: formData.email,
                mobile: formData.telephone,
                password: hashedPassword
            }
        });

        revalidatePath('/admin/staff');
        return {success: true, message: 'Staff added successfully'};
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        return {success: false, message: 'An error occurred while adding staff'};
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
                    ...(brandId !== 0 ? {drugBrandId: brandId} : {}),
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
                    ...(brandId !== 0 ? {drugBrandId: brandId} : {}), // Filter by brandId if it's not 0
                },
            },
        },
        include: {
            batch: {
                where: {
                    status: "AVAILABLE",
                    ...(brandId !== 0 ? {drugBrandId: brandId} : {}), // Apply brandId filter
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
        status: batch.status,
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
        orderBy: {id: "asc"},
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
                where: {id: reportId},
                include: {parameters: true}
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
                    where: {reportParameterId: param.id}
                });

                if (reportValues.length > 0) {
                    throw new Error(`Cannot delete parameter ${param.name} as it is in use`);
                }

                await tx.reportParameter.delete({
                    where: {id: param.id}
                });
            }

            // Update existing parameters
            for (const param of oldParams) {
                await tx.reportParameter.update({
                    where: {id: param.id},
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
                where: {id: reportId},
                data: {
                    name: reportForm.name,
                    description: reportForm.description
                }
            });

            revalidatePath('/admin/reports');
            return {success: true, message: 'Report type updated successfully'};
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
            return {success: false, message: 'Invalid telephone number'};
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
    } catch (e) {
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
    {formData}: {
        formData: InventoryFormData
    }): Promise<myError> {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Create or connect drug brand
            const brand = await tx.drugBrand.upsert({
                where: {id: formData.brandId ?? 0},
                update: {},
                create: {
                    name: formData.brandName,
                    description: formData.brandDescription || null
                }
            });

            // 2. Create or connect drug
            const drug = await tx.drug.upsert({
                where: {id: formData.drugId ?? 0},
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
                        connect: {id: drug.id}
                    },
                    drugBrand: {
                        connect: {id: brand.id}
                    },
                    type: formData.drugType as DrugType,
                    fullAmount: parseFloat(formData.quantity.toString()),
                    remainingQuantity: parseFloat(formData.quantity.toString()),
                    expiry: new Date(formData.expiry),
                    retailPrice: parseFloat(formData.retailPrice.toString()),
                    wholesalePrice: parseFloat(formData.wholesalePrice.toString()),
                    status: 'AVAILABLE'
                }
            });

            revalidatePath('/inventory/available-stocks');
            return {success: true, message: 'Item added successfully'};
        });
    } catch (e) {
        console.error(e);
        return {success: false, message: 'Failed to add item'};
    }
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
            retailPrice: batchData.retailPrice,
            wholesalePrice: batchData.wholesalePrice,
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
            where: {id: batchId},
            data: {status: newStatus},
        });

        console.log(`Batch ${batchId} updated to ${newStatus}.`);
    } catch (error) {
        console.error("Error updating batch status:", error);
    }
}

// Fetch functions for brand, drug, and batch data
export async function getBrandName(id: number): Promise<string> {
    try {
        const brand = await prisma.drugBrand.findUnique({
            where: {id},
            select: {name: true}
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
            where: {id},
            select: {name: true}
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
            where: {id},
            select: {number: true}
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
    const session = await verifySession();

    return prisma.queueEntry.count({
        where: {
            status: session.role === 'DOCTOR' ? 'PENDING' : {not: 'COMPLETED'}
        }
    });
}

const PAGE_SIZE = 10;

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
                const aUnit = a.retailPrice || 0;
                const bUnit = b.retailPrice || 0;
                return bUnit - aUnit;
            });
        case "unit-lowest":
            return data.sort((a, b) => {
                const aUnit = a.retailPrice || 0;
                const bUnit = b.retailPrice || 0;
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
                    name: {contains: query},
                    Batch: {some: {status: "AVAILABLE"}},
                },
            });
            break;
        case "model":
            count = await prisma.drug.count({
                where: {
                    name: {contains: query},
                    batch: {some: {status: "AVAILABLE"}},
                },
            });
            break;
        case "batch":
            count = await prisma.batch.count({
                where: {
                    OR: [
                        {drug: {name: {contains: query}}},
                        {drugBrand: {name: {contains: query}}},
                    ],
                    status: "AVAILABLE",
                },
            });
            break;
    }

    return Math.ceil(count / PAGE_SIZE);
}

// Fetch stock grouped by model
export async function getStockByModel({
                                          query = "",
                                          page = 1,
                                          sort = "alphabetically",
                                          startDate,
                                          endDate
                                      }: StockQueryParams): Promise<StockData[]> {
    const drugs = await prisma.drug.findMany({
        where: {
            name: {contains: query},
            batch: {
                some: {
                    // status: "AVAILABLE",
                    ...(startDate && endDate ? {
                        stockDate: {
                            gte: startDate,
                            lte: endDate
                        }
                    } : {})
                }
            },
        },
        include: {
            batch: {
                where: {
                    // status: "AVAILABLE",
                    ...(startDate && endDate ? {
                        stockDate: {
                            gte: startDate,
                            lte: endDate
                        }
                    } : {})
                },
                select: {
                    wholesalePrice: true,
                    retailPrice: true,
                    remainingQuantity: true,
                },
            },
        },
    });

    const stockData: StockData[] = drugs.map(drug => ({
        id: drug.id,
        name: drug.name,
        totalPrice: drug.batch.reduce(
            (sum: number, batch: { retailPrice: number; remainingQuantity: number }) =>
                sum + batch.retailPrice * batch.remainingQuantity,
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
                                          sort = "alphabetically",
                                          startDate,
                                          endDate,
                                      }: StockQueryParams): Promise<StockData[]> {
    const batches = await prisma.batch.findMany({
        where: {
            OR: [
                {drug: {name: {contains: query}}},
                {drugBrand: {name: {contains: query}}},
            ],
            // status: "AVAILABLE",
            ...(startDate && endDate ? {
                stockDate: {
                    gte: startDate,
                    lte: endDate
                }
            } : {})
        },
        include: {
            drug: true,
            drugBrand: true,
        },
    });

    const stockData: StockData[] = batches.map(batch => ({
        id: batch.id,
        name: `${batch.drugBrand.name} - ${batch.drug.name} (Batch ${batch.number})`,
        totalPrice: batch.retailPrice * batch.remainingQuantity,
        retailPrice: batch.retailPrice,
        wholesalePrice: batch.wholesalePrice,
        remainingQuantity: batch.remainingQuantity,
    }));

    const sortedData = applySorting(stockData, sort as SortOption);
    return sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

export async function getStockByBrand({
                                          query = "",
                                          page = 1,
                                          sort = "alphabetically",
                                          startDate,
                                          endDate,
                                      }: StockQueryParams): Promise<StockData[]> {
    // Ensure dates are properly formatted for Prisma
    const formattedStartDate = startDate ? new Date(startDate) : undefined;
    const formattedEndDate = endDate ? new Date(endDate) : undefined;

    const brands = await prisma.drugBrand.findMany({
        where: {
            name: {contains: query},
            Batch: {
                some: {
                    AND: [
                        // { status: "AVAILABLE" },
                        {
                            stockDate: {
                                gte: formattedStartDate,
                                lte: formattedEndDate,
                            },
                        },
                    ],
                },
            },
        },
        include: {
            Batch: {
                where: {
                    AND: [
                        // { status: "AVAILABLE" },
                        {
                            stockDate: {
                                gte: formattedStartDate,
                                lte: formattedEndDate,
                            },
                        },
                    ],
                },
                select: {
                    wholesalePrice: true,
                    retailPrice: true,
                    remainingQuantity: true,
                },
            },
        },
    });

    // Transform and sort the data
    const stockData: StockData[] = brands
        .filter(brand => brand.Batch.length > 0) // Only include brands with matching batches
        .map(brand => ({
            id: brand.id,
            name: brand.name,
            totalPrice: brand.Batch.reduce(
                (sum, batch) => sum + batch.retailPrice * batch.remainingQuantity,
                0
            ),
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
            available: 0,    // Will store available quantity value
            sold: 0,        // Will store sold quantity value
            expired: 0,     // Will store expired quantity value
            trashed: 0,     // Will store trashed quantity value
            errors: 0,      // Will store error quantity value
        };

        batches.forEach((batch) => {
            const pricePerUnit = batch.retailPrice;

            switch (batch.status) {
                case "AVAILABLE":
                    // For available status:
                    // - available = remainingQuantity * price
                    // - sold = (fullAmount - remainingQuantity) * price
                    analysis.available += batch.remainingQuantity * pricePerUnit;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        analysis.sold += (batch.fullAmount - batch.remainingQuantity) * pricePerUnit;
                    }
                    break;

                case "EXPIRED":
                    // For expired status:
                    // - expired = remainingQuantity * price
                    // - sold = (fullAmount - remainingQuantity) * price
                    analysis.expired += batch.remainingQuantity * pricePerUnit;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        analysis.sold += (batch.fullAmount - batch.remainingQuantity) * pricePerUnit;
                    }
                    break;

                case "COMPLETED":
                    // For completed status:
                    // - If there's remaining quantity, it's an error
                    // - sold = (fullAmount - remainingQuantity) * price
                    if (batch.remainingQuantity > 0) {
                        analysis.errors += batch.remainingQuantity * pricePerUnit;
                    }
                    analysis.sold += (batch.fullAmount - batch.remainingQuantity) * pricePerUnit;
                    break;

                case "TRASHED":
                    // For trashed status:
                    // - trashed = remainingQuantity * price
                    // - sold = (fullAmount - remainingQuantity) * price
                    analysis.trashed += batch.remainingQuantity * pricePerUnit;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        analysis.sold += (batch.fullAmount - batch.remainingQuantity) * pricePerUnit;
                    }
                    break;

                default:
                    // Any unknown status, count as error
                    analysis.errors += batch.fullAmount * pricePerUnit;
            }
        });

        return analysis;
    } catch (error) {
        console.error("Error fetching stock analysis:", error);
        throw new Error("Failed to fetch stock analysis");
    }
}


const PAGE_SIZE_COMPLETED_DRUGS_BY_BATCH = 15;

export async function getTotalPagesForCompletedFilteredDrugsByModel({
                                                                        query = "",
                                                                        status = "ALL",
                                                                        fromDate,
                                                                        toDate,
                                                                    }: {
    query?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}) {
    const whereCondition: Record<string, unknown> = {
        drug: {name: {contains: query}},
    };

    if (status === "ALL") {
        whereCondition.status = {not: "AVAILABLE"};
    } else {
        whereCondition.status = status as BatchStatus;
    }
    if (fromDate && toDate) {
        whereCondition.stockDate = {
            gte: new Date(fromDate),
            lte: new Date(toDate),
        };
    }

    const totalItems = await prisma.batch.count({where: whereCondition});
    return Math.ceil(totalItems / PAGE_SIZE_COMPLETED_DRUGS_BY_BATCH);
}

export async function getCompletedFilteredDrugsByModel({
                                                           query = "",
                                                           page = 1,
                                                           sort = "expiryDate",
                                                           status = "ALL",
                                                           fromDate,
                                                           toDate,
                                                       }: {
    query?: string;
    page?: number;
    sort?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}) {
    const whereCondition: Record<string, unknown> = {
        drug: {name: {contains: query}},
    };

    if (status === "ALL") {
        whereCondition.status = {not: "AVAILABLE"};
    } else {
        whereCondition.status = status as BatchStatus;
    }
    if (fromDate && toDate) {
        whereCondition.stockDate = {
            gte: new Date(fromDate),
            lte: new Date(toDate),
        };
    }

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
        status: batch.status,
    }));

    return sortAndPaginateBatches(formattedBatches, sort, page);
}

export async function getTotalPagesForCompletedFilteredDrugsByBrand({
                                                                        query = "",
                                                                        status = "ALL",
                                                                        fromDate,
                                                                        toDate,
                                                                    }: {
    query?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}) {
    const whereCondition: Record<string, unknown> = {
        drugBrand: {name: {contains: query}},
    };

    if (status === "ALL") {
        whereCondition.status = {not: "AVAILABLE"};
    } else {
        whereCondition.status = status as BatchStatus;
    }
    if (fromDate && toDate) {
        whereCondition.stockDate = {
            gte: new Date(fromDate),
            lte: new Date(toDate),
        };
    }

    const totalItems = await prisma.batch.count({where: whereCondition});
    return Math.ceil(totalItems / PAGE_SIZE_COMPLETED_DRUGS_BY_BATCH);
}

export async function getCompletedFilteredDrugsByBrand({
                                                           query = "",
                                                           page = 1,
                                                           sort = "expiryDate",
                                                           status = "ALL",
                                                           fromDate,
                                                           toDate,
                                                       }: {
    query?: string;
    page?: number;
    sort?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}) {
    const whereCondition: Record<string, unknown> = {
        drugBrand: {name: {contains: query}},
    };

    if (status === "ALL") {
        whereCondition.status = {not: "AVAILABLE"};
    } else {
        whereCondition.status = status as BatchStatus;
    }
    if (fromDate && toDate) {
        whereCondition.stockDate = {
            gte: new Date(fromDate),
            lte: new Date(toDate),
        };
    }

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
        status: batch.status,
    }));

    return sortAndPaginateBatches(formattedBatches, sort, page);
}

export async function getTotalPagesForCompletedFilteredDrugsByBatch({
                                                                        query = "",
                                                                        status = "ALL",
                                                                        fromDate,
                                                                        toDate,
                                                                    }: {
    query?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}) {

    const whereCondition: Record<string, unknown> = {
        number: {contains: query},
    };

    if (status === "ALL") {
        whereCondition.status = {not: "AVAILABLE"};
    } else {
        whereCondition.status = status as BatchStatus;
    }
    if (fromDate && toDate) {
        whereCondition.stockDate = {
            gte: new Date(fromDate),
            lte: new Date(toDate),
        };
    }

    const totalItems = await prisma.batch.count({where: whereCondition});
    return Math.ceil(totalItems / PAGE_SIZE_COMPLETED_DRUGS_BY_BATCH);
}

export async function getCompletedFilteredDrugsByBatch({
                                                           query = "",
                                                           page = 1,
                                                           sort = "expiryDate",
                                                           status = "ALL",
                                                           fromDate,
                                                           toDate,
                                                       }: {
    query?: string;
    page?: number;
    sort?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}) {
    const whereCondition: Record<string, unknown> = {
        number: {contains: query},
    };

    if (status === "ALL") {
        whereCondition.status = {not: "AVAILABLE"};
    } else {
        whereCondition.status = status as BatchStatus;
    }
    if (fromDate && toDate) {
        whereCondition.stockDate = {
            gte: new Date(fromDate),
            lte: new Date(toDate),
        };
    }

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
        status: batch.status,
    }));

    return sortAndPaginateBatches(formattedBatches, sort, page);
}


function sortAndPaginateBatches(batches: {
    id: number;
    batchNumber: string;
    brandName: string;
    modelName: string;
    expiryDate: string;
    stockDate: string;
    remainingAmount: number;
    fullAmount: number;
    status: string;
}[], sort: string, page: number) {
    if (sort === "expiryDate") {
        batches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    } else if (sort === "newlyAdded") {
        batches.sort((a, b) => new Date(b.stockDate).getTime() - new Date(a.stockDate).getTime());
    } else if (sort === "alphabetically") {
        batches.sort((a, b) => a.modelName.localeCompare(b.modelName));
    }

    return batches.slice(
        (page - 1) * PAGE_SIZE_COMPLETED_DRUGS_BY_BATCH,
        page * PAGE_SIZE_COMPLETED_DRUGS_BY_BATCH
    );
}


export async function getIssuedPatients(batchId: number) {
    return await prisma.issue.findMany({
        where: {batchId},
        select: {
            id: true,
            quantity: true,
            prescriptionId: true,
            prescription: {
                select: {
                    time: true,
                    patientId: true,
                    patient: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    }).then(issues =>
        issues.map(issue => ({
            id: issue.id,
            issuedDate: issue.prescription.time.toISOString().split('T')[0],
            patientId: issue.prescription.patientId,
            patientName: issue.prescription.patient.name,
            prescriptionId: issue.prescriptionId,
            issuedAmount: issue.quantity,
        }))
    );
}


//Suggest the name when adding the drugs

export async function searchDrugBrands(query: string) {
    if (!query || query.length < 2) return [];

    return prisma.drugBrand.findMany({
        where: {
            name: {
                startsWith: query,
            },
        },
        select: {
            id: true,
            name: true,
            description: true,
        },
        take: 8,
    });
}

export async function searchDrugModels(query: string) {
    if (!query || query.length < 2) return [];

    return prisma.drug.findMany({
        where: {
            name: {
                startsWith: query,
            },
        },
        select: {
            id: true,
            name: true,
        },
        take: 8,
    });
}


// export async function getPriceOfDrugModel({
//     query,
//     page = 1,
//     startDate,
//     endDate,
// }: StockQueryParams){
//     const take = 10;
//     const skip = (page - 1) * take;

//     const drugs = await prisma.drug.findMany({
//         where: {
//             name: {
//                 contains: query,
//             },
//             batch: {
//                 some: {
//                     stockDate:{
//                         gte: startDate,
//                         lte: endDate,
//                     },
//                 },
//             },
//         },

//         select: {
//       id: true,
//       name: true,
//       batch: {
//         where: {
//           status: 'AVAILABLE',
//         },
//         select: {
//           remainingQuantity: true,
//           price: true,
//         },
//       },
//     },
//     skip,
//     take,
// });

//     return drugs.map(drug => ({
//     id: drug.id,
//     name: drug.name,
//     totalPrice: drug.batch.reduce((sum, batch) =>
//       sum + (batch.price * batch.remainingQuantity), 0),
//     remainingQuantity: drug.batch.reduce((sum, batch) =>
//       sum + batch.remainingQuantity, 0),
//   }));
// }


//show the info of one drug model
export async function getDrugModelStats(drugId: number) {

    try {
        const batches = await prisma.batch.findMany({
            where: {
                drugId: drugId,
            },
            select: {
                status: true,
                remainingQuantity: true,
                retailPrice: true,
                wholesalePrice: true,
                fullAmount: true,
            },
        });

        const stats = {
            available: {quantity: 0, value: 0},
            sold: {quantity: 0, value: 0},
            expired: {quantity: 0, value: 0},
            trashed: {quantity: 0, value: 0},
            errors: {quantity: 0, value: 0},

        };

        batches.forEach(batch => {
            switch (batch.status) {
                case 'AVAILABLE':
                    stats.available.quantity += batch.remainingQuantity;
                    stats.available.value += batch.retailPrice * batch.remainingQuantity;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        stats.sold.quantity += (batch.fullAmount - batch.remainingQuantity);
                        stats.sold.value += (batch.fullAmount - batch.remainingQuantity) * batch.retailPrice;
                    }
                    break;

                case 'EXPIRED':
                    stats.expired.quantity += batch.remainingQuantity;
                    stats.expired.value += batch.retailPrice * batch.remainingQuantity;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        stats.sold.quantity += (batch.fullAmount - batch.remainingQuantity);
                        stats.sold.value += (batch.fullAmount - batch.remainingQuantity) * batch.retailPrice;
                    }
                    break;

                case 'COMPLETED':
                    if (batch.remainingQuantity > 0) {
                        stats.errors.quantity += batch.remainingQuantity;
                        stats.errors.value += batch.remainingQuantity * batch.retailPrice;
                    }
                    stats.sold.quantity += (batch.fullAmount - batch.remainingQuantity);
                    stats.sold.value += (batch.fullAmount - batch.remainingQuantity) * batch.retailPrice;
                    break;
                case 'TRASHED':
                    stats.trashed.quantity += batch.remainingQuantity;
                    stats.trashed.value += batch.remainingQuantity * batch.retailPrice;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        stats.sold.value += (batch.fullAmount - batch.remainingQuantity) * batch.retailPrice;
                        stats.sold.quantity += (batch.fullAmount - batch.remainingQuantity);
                    }
                    break;
                default:
                    // Any unknown status, count as error
                    stats.errors.value += batch.fullAmount * batch.retailPrice;
                    stats.errors.quantity += batch.fullAmount;
            }
        });

        return stats;

    } catch (error) {
        console.error("Error fetching stock analysis:", error);
        throw new Error("Failed to fetch stock analysis");
    }
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

        // check for repeated drugs
        const drugIds = prescriptionForm.issues.map(issue => issue.drugId);
        const uniqueDrugIds = new Set(drugIds);
        if (drugIds.length !== uniqueDrugIds.size) {
            return {success: false, message: 'Repeated drugs are not allowed in a single prescription'};
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
                    details: prescriptionForm.description,
                    status: 'PENDING',
                    extraDoctorCharge: Number(prescriptionForm.extraDoctorCharges),
                    // Create issues
                    issues: {
                        create: prescriptionForm.issues.map(issue => ({
                            drugId: issue.drugId,
                            details: issue.details,
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

            //Check for queue entry
            console.log(patientID);
            const queueEntry = await tx.queueEntry.findFirst({
                where: {
                    patientId: patientID,
                    status: "PENDING"
                }
            });

            console.log(queueEntry);

            if (queueEntry) {
                revalidatePath(`/queue/${queueEntry.id}`);
                await tx.queueEntry.update({
                    where: {
                        id: queueEntry.id
                    },
                    data: {
                        status: "PRESCRIBED"
                    }
                });
            }

            // Update strategy history for each issue
            await Promise.all(
                prescriptionForm.issues.map((issue, index) => {
                    const createdIssue = prescription.issues[index]; // Get the corresponding created issue

                    return tx.stratergyHistory.upsert({
                        where: {
                            drugId: issue.drugId
                        },
                        update: {
                            brandId: issue.brandId,
                            issueId: createdIssue.id
                        },
                        create: {
                            drugId: issue.drugId,
                            brandId: issue.brandId,
                            issueId: createdIssue.id
                        }
                    });
                })
            );
        });

        revalidatePath(`/patients/${patientID}/prescriptions`);
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
            issue: true,
            brand: {
                select: {
                    name: true
                }
            }
        }
    });
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
                    expiry: true,
                    type: true
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


//For prescriptions page
export async function getPrescriptionsCount(patientID: number) {
    return prisma.prescription.count({
        where: {
            patientId: patientID
        }
    });
}

export async function searchPrescriptions({patientID, query, filter, take, skip}: {
    patientID: number;
    query: string;
    filter: string;
    take: number;
    skip: number;
}) {
    let where = {};
    const session = await verifySession();

    if (query) {
        if (filter === "symptom") {
            where = {
                presentingSymptoms: {
                    contains: query
                }
            };
        }
        if (filter === "drug") {
            where = {
                OR: [
                    {
                        issues: {
                            some: {
                                drug: {
                                    name: {
                                        contains: query
                                    }
                                }
                            }
                        }
                    },
                    {
                        OffRecordMeds: {
                            some: {
                                name: {
                                    contains: query
                                }
                            }
                        }
                    }
                ]
            };
        }
    }

    // Only pending prescriptions can be viewed by non-doctor users
    if (session.role !== 'DOCTOR') {
        where = {
            ...where,
            status: "PENDING"
        };
    }

    return prisma.prescription.findMany({
        where: {
            patientId: patientID,
            ...where
        },
        take,
        skip,
        orderBy: {
            time: 'desc'
        },
        include: {
            issues: {
                include: {
                    drug: true
                }
            },
            OffRecordMeds: {
                select: {
                    name: true,
                }
            }
        }
    });
}

export async function searchPrescriptionCount({patientID, query, filter}: {
    patientID: number;
    query: string;
    filter: string;
}) {
    let where = {};

    if (query) {
        if (filter === "symptom") {
            where = {
                presentingSymptoms: {
                    contains: query
                }
            };
        }
        if (filter === "drug") {
            where = {
                OR: [
                    {
                        issues: {
                            some: {
                                drug: {
                                    name: {
                                        contains: query
                                    }
                                }
                            }
                        }
                    },
                    {
                        OffRecordMeds: {
                            some: {
                                name: {
                                    contains: query
                                }
                            }
                        }
                    }
                ]
            };
        }
    }

    return prisma.prescription.count({
        where: {
            patientId: patientID,
            ...where
        }
    });
}

export async function getPrescription(prescriptionID: number, patientID: number) {
    const session = await verifySession();
    return prisma.prescription.findUnique({
        where: {
            id: prescriptionID,
            patientId: patientID,
            ...(session.role !== 'DOCTOR' && {status: 'PENDING'})
        },
        include: {
            issues: {
                include: {
                    drug: true,
                    brand: true,
                    batch: true
                }
            },
            OffRecordMeds: true
        }
    })
}

export async function getBatches({drugID, brandID}: { drugID: number, brandID: number }) {
    return prisma.batch.findMany({
        where: {
            drugId: drugID,
            drugBrandId: brandID,
            status: "AVAILABLE"
        },
        select: {
            id: true,
            number: true,
            remainingQuantity: true,
            expiry: true
        }
    });
}

export async function getCachedBatch({drugId, brandId}: { drugId: number, brandId: number }) {
    return prisma.batchHistory.findUnique({
        where: {
            drugId_drugBrandId: {
                drugId,
                drugBrandId: brandId
            }
        }, select: {
            batchId: true
        }
    });
}

export async function calculateBill({prescriptionData}: {
    prescriptionData: BatchAssignPayload
}): Promise<myBillError> {
    const prescriptionID = prescriptionData.prescriptionID;
    const batchAssignments = prescriptionData.batchAssigns;

    try {
        return await prisma.$transaction(async (prisma): Promise<myBillError> => {
            const prescription = await prisma.prescription.findUnique({
                where: {id: prescriptionID},
            });

            if (!prescription) {
                return {success: false, message: 'Prescription not found'};
            }

            if (prescription.status === 'COMPLETED') {
                return {success: false, message: 'Prescription already completed'};
            }

            let dspFees: number = 0;
            const dispensaryFee = await prisma.charge.findUnique({
                where: {
                    name: ChargeType.DISPENSARY
                }
            })

            if (dispensaryFee) {
                dspFees = dispensaryFee.value;
            }

            let dctFee: number = 0;
            const doctorFee = await prisma.charge.findUnique({
                where: {
                    name: ChargeType.DOCTOR
                }
            })

            if (doctorFee) {
                dctFee = doctorFee.value;
            }

            const bill: Bill = {
                patientID: prescriptionData.patientID,
                dispensary_charge: dspFees,
                doctor_charge: dctFee + (prescription.extraDoctorCharge ?? 0),
                cost: 0,
                entries: [],
            };

            for (let i = 0; i < batchAssignments.length; i++) {
                const assign = batchAssignments[i];
                if (!assign.batchID) {
                    return {success: false, message: `Batch not found for a drug`};
                }

                const batch = await prisma.batch.findUnique({
                    where: {id: assign.batchID},
                    include: {drug: true, drugBrand: true},
                });

                if (!batch) {
                    return {success: false, message: `Batch not found for drug ${assign.batchID}`};
                }

                const issue = await prisma.issue.findUnique({
                    where: {id: assign.issueID},
                });

                if (!issue) {
                    return {success: false, message: `Issue not found for drug ${assign.issueID}`};
                }

                // Updating or creating the cache
                await prisma.batchHistory.upsert({
                    where: {
                        drugId_drugBrandId: {
                            drugId: batch.drugId,
                            drugBrandId: batch.drugBrandId
                        }
                    },
                    update: {
                        batchId: assign.batchID
                    },
                    create: {
                        drugId: batch.drugId,
                        drugBrandId: batch.drugBrandId,
                        batchId: assign.batchID
                    }
                });


                await prisma.issue.update({
                    where: {id: assign.issueID},
                    data: {batchId: assign.batchID},
                });

                const batchCost = issue.quantity * batch.retailPrice;
                bill.cost += batchCost;

                bill.entries.push({
                    drugName: batch.drug.name,
                    brandName: batch.drugBrand.name,
                    quantity: issue.quantity,
                    unitPrice: batch.retailPrice
                });
            }

            await prisma.bill.upsert({
                where: {
                    prescriptionId: prescriptionID
                },
                update: {
                    doctorCharge: bill.doctor_charge,
                    dispensaryCharge: bill.dispensary_charge,
                    medicinesCharge: bill.cost
                },
                create: {
                    prescriptionId: prescriptionID,
                    doctorCharge: bill.doctor_charge,
                    dispensaryCharge: bill.dispensary_charge,
                    medicinesCharge: bill.cost
                }
            });


            return {success: true, message: 'Bill calculated successfully', bill};
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error(error.message);
        }
        return {success: false, message: 'An error occurred while calculating bill'};
    }
}

export async function getBill(prescriptionID: number): Promise<Bill> {
    const prescription = await prisma.prescription.findUnique({
        where: {id: prescriptionID},
        include: {
            issues: {
                include: {
                    batch: true,
                    drug: true,
                    brand: true,
                }
            },
            Bill: true
        }
    });

    if (!prescription) {
        throw new Error('Prescription not found');
    }

    if (prescription.status === 'PENDING' || !prescription.Bill || !prescription.issues.every(issue => issue.batch)) {
        throw new Error('Prescription not completed');
    }

    return {
        patientID: prescription.patientId,
        dispensary_charge: prescription.Bill.dispensaryCharge,
        doctor_charge: prescription.Bill.doctorCharge,
        cost: (prescription.Bill.medicinesCharge + prescription.Bill.dispensaryCharge + prescription.Bill.doctorCharge),
        entries: prescription.issues.map(issue => ({
            drugName: issue.drug.name,
            brandName: issue.brand.name,
            quantity: issue.quantity,
            unitPrice: issue.batch?.retailPrice ?? 0,
        }))
    };
}

export async function completePrescription(prescriptionID: number): Promise<myError> {
    try {
        const prescription = await prisma.prescription.findUnique({
            where: {id: prescriptionID},
            include: {
                issues: {
                    include: {
                        batch: true
                    }
                }
            }
        });

        if (!prescription) {
            return {success: false, message: 'Prescription not found'};
        }

        if (prescription.status === 'COMPLETED') {
            return {success: false, message: 'Prescription already completed'};
        }

        if (!prescription.issues.every(issue => issue.batch)) {
            return {success: false, message: 'Prescription not completed'};
        }

        // Updating remaining quantity of batches
        await prisma.$transaction(async (prisma) => {
            for (let i = 0; i < prescription.issues.length; i++) {
                const issue = prescription.issues[i];
                if (!issue.batch || !issue.batchId) {
                    return {success: false, message: 'Batch not found for a drug'};
                }
                await prisma.batch.update({
                    where: {id: issue.batchId},
                    data: {
                        remainingQuantity: {
                            decrement: issue.quantity
                        }
                    }
                });
            }

            await prisma.prescription.update({
                where: {id: prescriptionID},
                data: {status: 'COMPLETED'}
            });

            //Check for queue entry
            const queueEntry = await prisma.queueEntry.findFirst({
                where: {
                    patientId: prescription.patientId,
                    status: "PRESCRIBED"
                }
            });

            if (queueEntry) {
                await prisma.queueEntry.update({
                    where: {
                        id: queueEntry.id
                    },
                    data: {
                        status: "COMPLETED"
                    }
                });
                revalidatePath(`/queue/${queueEntry.id}`);
            }
        });
        revalidatePath(`/patients/${prescription.patientId}/prescriptions`);
        return {success: true, message: 'Prescription completed successfully'};
    } catch (error) {
        console.error('Error completing prescription:', error);
        return {success: false, message: 'An error occurred while completing prescription'};
    }
}


export async function getCharges() {
    return prisma.charge.findMany({
        where: {
            OR: [
                {name: ChargeType.DISPENSARY},
                {name: ChargeType.DOCTOR}
            ]
        }
    })
}

export async function updateCharges({charge, value}: { charge: ChargeType, value: number }): Promise<myError> {
    try {
        await prisma.charge.upsert({
            where: {name: charge},
            update: {value},
            create: {name: charge, value}
        });

        return {success: true, message: `Charge for ${charge} updated successfully`};
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            console.error(e);
        }

        return {success: false, message: 'An error occurred while updating charge'};
    }
}

//server actions for getting daily income.

export async function getDailyIncomes(dateRange: DateRange) {
  const { startDate, endDate } = dateRange;

  console.log(`Getting daily incomes for ${startDate} to ${endDate}`);
  // First get all bills with their prescriptions for the date range
  const bills = await prisma.bill.findMany({
    where: {
      Prescription: {
        time: {
          gte: startDate,
          lte: endDate,
        }
      }
    },
    include: {
      Prescription: {
        select: {
          time: true,
        }
      }
    }
  });

  // Group bills by date and calculate totals
  const groupedByDate = bills.reduce((acc, bill) => {
    const date = bill.Prescription.time.toISOString().split('T')[0];

    if (!acc[date]) {
      acc[date] = {
        totalIncome: 0,
        patientCount: 0,
      };
    }

    // Calculate total income for this bill
    const totalBillAmount =
      (bill.doctorCharge || 0) +
      (bill.dispensaryCharge || 0) +
      (bill.medicinesCharge || 0);

    acc[date].totalIncome += totalBillAmount;
    acc[date].patientCount += 1;

    console.log(`${acc[date].totalIncome} ${acc[date].patientCount}`);
    return acc;
  }, {} as Record<string, { totalIncome: number; patientCount: number }>);

  // Convert to array and sort by date
  const dailyIncomes = Object.entries(groupedByDate).map(([date, data]) => ({
    date,
    totalIncome: data.totalIncome,
    patientCount: data.patientCount,
  }));

  // Sort by date in descending order (most recent first)
  return dailyIncomes.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getIncomeStats(dateRange: DateRange) {
  const dailyIncomes = await getDailyIncomes(dateRange);

  const totalIncome = dailyIncomes.reduce((sum, day) => sum + day.totalIncome, 0);
  const patientCount = dailyIncomes.reduce((sum, day) => sum + day.patientCount, 0);

  return {
    totalIncome,
    patientCount,
    averagePerPatient: patientCount > 0 ? totalIncome / patientCount : 0,
  };
}