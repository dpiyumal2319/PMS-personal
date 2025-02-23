"use server";

import {revalidatePath} from "next/cache";
import {
    DateRange,
    InventoryFormData,
    myError,
    PatientFormData,
    SortOption,
    StockAnalysis,
    StockData,
    StockQueryParams,
    DrugConcentrationDataSuggestion
} from "@/app/lib/definitions";
import {prisma} from "./prisma";
import {verifySession} from "./sessions";
import bcrypt from "bcryptjs";
import {BatchStatus, DrugType, Prisma, Role} from "@prisma/client";
import {ChangePasswordFormData} from "@/app/(dashboard)/admin/_components/ChangePasswordDialog";
import {EditUserProfileFormData} from "@/app/(dashboard)/admin/_components/EditProfileDialog";
import {validateEmail, validateMobile} from "@/app/lib/utils";
import {AddUserFormData} from "@/app/(dashboard)/admin/staff/_components/AddUserDialog";
import {SearchType} from "@/app/(dashboard)/queue/[id]/_components/CustomSearchSelect";

export async function changePassword({
                                         currentPassword,
                                         newPassword,
                                         confirmPassword,
                                         userID,
                                     }: ChangePasswordFormData): Promise<myError> {
    try {
        if (newPassword !== confirmPassword) {
            return {success: false, message: "Passwords do not match"};
        }

        const session = await verifySession(); // Get current user session

        // Fetch target user
        const user = await prisma.user.findUnique({
            where: {id: userID},
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
                    return {
                        success: false,
                        message: "Current password is incorrect",
                    };
                }
            }
        } else {
            // Non-doctors can only change their own password and must provide current password
            if (session.id !== userID) {
                return {
                    success: false,
                    message:
                        "You do not have permission to change this user's password",
                };
            }
            if (!bcrypt.compareSync(currentPassword, user.password)) {
                return {
                    success: false,
                    message: "Current password is incorrect",
                };
            }
        }

        // Hash and update password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await prisma.user.update({
            where: {id: userID},
            data: {password: hashedPassword},
        });

        return {success: true, message: "Password changed successfully"};
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        return {
            success: false,
            message: "An error occurred while changing password",
        };
    }
}

export async function getUser(id: number) {
    const session = await verifySession();

    if (session.role !== Role.DOCTOR && session.id !== id) {
        throw new Error("You do not have permission to view this user");
    }

    return prisma.user.findUnique({
        where: {id},
        select: {
            name: true,
            email: true,
            mobile: true,
            role: true,
            image: true,
            gender: true,
        },
    });
}

export async function deleteUser(id: number): Promise<myError> {
    try {
        const session = await verifySession();

        if (session.id === id) {
            return {
                success: false,
                message: "You cannot delete your own account",
            };
        }

        if (session.role !== Role.DOCTOR) {
            return {
                success: false,
                message: "You do not have permission to delete users",
            };
        }

        await prisma.user.delete({
            where: {id},
        });

        revalidatePath("/admin/staff");
        revalidatePath("/admin/profile");
        return {success: true, message: "User deleted successfully"};
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        return {
            success: false,
            message: "An error occurred while deleting user",
        };
    }
}

export async function editProfile(formData: EditUserProfileFormData) {
    try {
        if (
            !formData.name ||
            !formData.email ||
            !formData.telephone ||
            !formData.gender
        ) {
            return {success: false, message: "Please fill all fields"};
        }

        if (validateEmail(formData.email)) {
            return {success: false, message: "Invalid email address"};
        }

        if (validateMobile(formData.telephone)) {
            return {success: false, message: "Invalid telephone number"};
        }

        const session = await verifySession();

        if (!(session.role === Role.DOCTOR)) {
            if (session.id !== formData.id) {
                return {
                    success: false,
                    message: "You do not have permission to edit this profile",
                };
            }
        }

        await prisma.user.update({
            where: {id: formData.id},
            data: {
                name: formData.name,
                email: formData.email,
                mobile: formData.telephone,
                image: formData.image,
                gender: formData.gender,
            },
        });

        revalidatePath("/admin/staff");
        revalidatePath("/admin/profile");

        if (session.id === formData.id) {
            revalidatePath("/");
        }

        return {success: true, message: "Profile updated successfully"};
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        return {
            success: false,
            message: "An error occurred while updating profile",
        };
    }
}

export async function addUser({
                                  formData,
                              }: {
    formData: AddUserFormData;
}): Promise<myError> {
    try {
        if (
            !formData.name ||
            !formData.email ||
            !formData.telephone ||
            !formData.gender
        ) {
            return {success: false, message: "Please fill all fields"};
        }

        if (validateEmail(formData.email)) {
            return {success: false, message: "Invalid email address"};
        }

        if (validateMobile(formData.telephone)) {
            return {success: false, message: "Invalid telephone number"};
        }

        if (!formData.password) {
            return {success: false, message: "Password is required"};
        }

        if (formData.password.length < 8) {
            return {
                success: false,
                message: "Password must be at least 8 characters",
            };
        }

        if (!(formData.password === formData.confirmPassword)) {
            return {success: false, message: "Passwords do not match"};
        }

        const session = await verifySession();

        if (session.role !== Role.DOCTOR) {
            return {
                success: false,
                message: "You do not have permission to add staff",
            };
        }

        const hashedPassword = bcrypt.hashSync(formData.password, 10);

        await prisma.user.create({
            data: {
                name: formData.name,
                gender: formData.gender,
                role: Role.NURSE,
                email: formData.email,
                mobile: formData.telephone,
                password: hashedPassword,
            },
        });

        revalidatePath("/admin/staff");
        return {success: true, message: "Staff added successfully"};
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        return {
            success: false,
            message: "An error occurred while adding staff",
        };
    }
}

export async function addQueue(): Promise<myError> {
    try {
        const activeQueuesCount = await prisma.queue.count({
            where: {
                status: "IN_PROGRESS",
            },
        });

        if (activeQueuesCount !== 0) {
            return {
                success: false,
                message: "There is already an active queue",
            };
        }

        await prisma.queue.create({
            data: {},
        });
        revalidatePath("/queues");
        return {success: true, message: "Queue created successfully"};
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: "An error occurred while creating queue",
        };
    }
}

export async function getQueues(offset: number, limit: number) {
    return prisma.queue.findMany({
        skip: offset,
        take: limit,
        orderBy: {
            id: "desc",
        },
        include: {
            _count: {
                select: {entries: true},
            },
        },
    });
}

export async function getQueue(queueId: number) {
    return prisma.queue.findUnique({
        where: {
            id: queueId,
        },
    });
}

export async function getTotalQueueCount() {
    return prisma.queue.count();
}

export async function getTotalPages(query = "", filter = "name") {
    const whereClause = query
        ? {
            [filter]: {contains: query, mode: "insensitive"},
        }
        : {};

    const totalPatients = await prisma.patient.count({where: whereClause});
    return Math.ceil(totalPatients / PAGE_SIZE);
}

export async function getFilteredPatients(
    query: string = "",
    page: number = 1,
    filter: string = "name"
) {
    const whereCondition = query
        ? {
            [filter]: {contains: query, mode: "insensitive"},
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
                mode: "insensitive",
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
            by: ["drugBrandId"],
            where: {
                drugId: modelId,
                status: "AVAILABLE",
            },
        });

        return Math.ceil(
            uniqueBrandCount.length / PAGE_SIZE_AVAILABLE_DRUGS_BY_BRAND
        );
    }

    const totalItems = await prisma.drugBrand.count({
        where: {
            name: {
                contains: query,
                mode: "insensitive",
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
    status: BatchStatus;
    number: {
        contains: string;
        mode: "insensitive";
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
            mode: "insensitive",
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
                                                  brandId = 0,
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
                mode: "insensitive",
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
            const uniqueBrandIds = new Set(
                drug.batch.map((batch) => batch.drugBrand.id)
            );

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
        aggregatedDrugs.sort(
            (a, b) => a.totalRemainingQuantity - b.totalRemainingQuantity
        );
    } else if (sort === "highest") {
        aggregatedDrugs.sort(
            (a, b) => b.totalRemainingQuantity - a.totalRemainingQuantity
        );
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
                                                  modelId = 0,
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

        batches.forEach((batch) => {
            uniqueBrands.set(batch.drugBrand.id, {
                id: batch.drugBrand.id,
                name: batch.drugBrand.name,
                modelCount: 1, // Since it's a specific model
            });
        });

        return Array.from(uniqueBrands.values());
    }

    // Fetch all drug brands with available batches
    const brands = await prisma.drugBrand.findMany({
        where: {
            name: {
                contains: query,
                mode: "insensitive",
            },
        },
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
                                                  brandId = 0,
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
            mode: "insensitive",
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
            (a, b) =>
                new Date(a.expiryDate).getTime() -
                new Date(b.expiryDate).getTime()
        );
    } else if (sort === "newlyAdded") {
        formattedBatches.sort(
            (a, b) =>
                new Date(b.stockDate).getTime() -
                new Date(a.stockDate).getTime()
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
            return {success: false, message: "Queue ID not provided"};
        }

        const numberId = parseInt(id);

        const queue = await prisma.queue.findUnique({
            where: {
                id: numberId,
            },
        });

        if (!queue) {
            return {success: false, message: "Queue not found"};
        }

        if (queue.status === "COMPLETED") {
            return {success: false, message: "Queue is already stopped"};
        }

        const UncompletedQueueEntries = await prisma.queueEntry.findMany({
            where: {
                queueId: numberId,
                status: {
                    not: "COMPLETED",
                },
            },
        });

        if (UncompletedQueueEntries.length > 0) {
            return {success: false, message: "Queue has uncompleted entries"};
        }

        await prisma.queue.update({
            where: {
                id: numberId,
            },
            data: {
                status: "COMPLETED",
            },
        });
        return {success: true, message: "Queue stopped successfully"};
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: "An error occurred while stopping queue",
        };
    }
}

export async function getQueueStatus(id: number) {
    return prisma.queue.findUnique({
        where: {
            id,
        },
        select: {
            status: true,
        },
    });
}

export async function getQueueStatusesCount(id: number) {
    try {
        const result = await prisma.queueEntry.groupBy({
            by: ["status"],
            where: {
                queueId: id,
            },
            _count: {
                status: true,
            },
        });

        const statuses = {
            PENDING: 0,
            PRESCRIBED: 0,
            COMPLETED: 0,
        };

        result.forEach((item) => {
            statuses[item.status] = item._count.status;
        });

        return statuses;
    } catch (e) {
        console.error(e);
        throw new Error("An error occurred while getting queue statuses count");
    }
}

export async function queuePatients(id: number) {
    try {
        return await prisma.queueEntry.findMany({
            where: {
                queueId: id,
            },
            include: {
                patient: true,
                queue: true,
            },
            orderBy: {
                token: "asc",
            },
        });
    } catch (e) {
        console.error(e);
        throw new Error("An error occurred while getting queue patients");
    }
}

export async function removePatientFromQueue(
    queueId: number,
    token: number
): Promise<myError> {
    try {
        await prisma.queueEntry.delete({
            where: {
                queueId_token: {
                    queueId,
                    token,
                },
            },
        });

        revalidatePath(`/queue/${queueId}`);
        return {success: true, message: "Patient removed successfully"};
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: "An error occurred while removing patient from queue",
        };
    }
}

export async function searchPatients(
    query: string,
    searchBy: SearchType
) {
    if (!query) return [];

    return prisma.patient.findMany({
        where: {
            [searchBy]: {
                contains: query,
                mode: "insensitive",
            },
        },
        take: 10, // Limit results
    });
}

export async function addPatientToQueue(
    queueId: number,
    patientId: number
): Promise<myError> {
    try {
        const queue = await prisma.queue.findUnique({
            where: {
                id: queueId,
            },
        });

        if (!queue) {
            return {success: false, message: "Queue not found"};
        }

        const patient = await prisma.patient.findUnique({
            where: {
                id: patientId,
            },
        });

        if (!patient) {
            return {success: false, message: "Patient not found"};
        }

        if (queue.status === "COMPLETED") {
            return {success: false, message: "Queue is stopped"};
        }

        const lastToken = await prisma.queueEntry.findFirst({
            where: {
                queueId,
            },
            orderBy: {
                token: "desc",
            },
        });

        const token = lastToken ? lastToken.token + 1 : 1;

        await prisma.queueEntry.create({
            data: {
                queueId,
                patientId,
                token,
            },
        });

        revalidatePath(`/queue/${queueId}`);
        return {
            success: true,
            message: "Patient added to queue successfully",
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: "An error occurred while adding patient to queue",
        };
    }
}

export async function getActiveQueue() {
    try {
        return await prisma.queue.findFirst({
            where: {
                status: 'IN_PROGRESS',
            },
        });
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getPatientDetails(id: number) {
    return prisma.patient.findUnique({
        where: {
            id,
        },
    });
}

export async function getFilteredReports(query: string) {
    return prisma.reportType.findMany({
        where: {
            name: {
                contains: query,
                mode: "insensitive",
            },
        },
        orderBy: {id: "asc"},
        include: {
            parameters: true,
        },
    });
}

export async function getTotalReportTemplateCount() {
    return prisma.reportType.count();
}

export async function addReportType(reportForm: ReportForm): Promise<myError> {
    try {
        if (reportForm.parameters.length === 0) {
            return {
                success: false,
                message: "At least one parameter is required",
            };
        }

        await prisma.reportType.create({
            data: {
                name: reportForm.name,
                description: reportForm.description,
                parameters: {
                    create: reportForm.parameters,
                },
            },
        });

        revalidatePath("/reports");
        return {success: true, message: "Report type added successfully"};
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === "P2002") {
                return {
                    success: false,
                    message: "Report type name must be unique",
                };
            }
            if (e.code === "P2003") {
                return {
                    success: false,
                    message:
                        "Invalid parameter reference (foreign key constraint failed)",
                };
            }
        }
        console.error(e);

        return {
            success: false,
            message: "An unexpected error occurred while adding report type",
        };
    }
}

export async function getReportType(reportId: number) {
    return prisma.reportType.findUnique({
        where: {
            id: reportId,
        },
        include: {
            parameters: true,
        },
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

export async function editReportType(
    reportForm: ReportForm,
    reportId: number
): Promise<myError> {
    try {
        return await prisma.$transaction(async (tx) => {
            const report = await tx.reportType.findUnique({
                where: {id: reportId},
                include: {parameters: true},
            });

            if (!report) {
                throw new Error("Report type not found");
            }

            const newParams = reportForm.parameters.filter(
                (param) => param.isNew
            );
            const oldParams = reportForm.parameters.filter(
                (param) => !param.isNew
            );

            for (const params of report.parameters) {
                if (newParams.find((param) => param.name === params.name)) {
                    throw new Error(
                        "Cannot add an existing parameter. Do not remove and add the same parameter."
                    );
                }
            }

            // Delete removed parameters
            const deletedParams = report.parameters.filter(
                (param) => !oldParams.find((p) => p.id === param.id)
            );

            for (const param of deletedParams) {
                const reportValues = await tx.reportValue.findMany({
                    where: {reportParameterId: param.id},
                });

                if (reportValues.length > 0) {
                    throw new Error(
                        `Cannot delete parameter ${param.name} as it is in use`
                    );
                }

                await tx.reportParameter.delete({
                    where: {id: param.id},
                });
            }

            // Update existing parameters
            for (const param of oldParams) {
                await tx.reportParameter.update({
                    where: {id: param.id},
                    data: {
                        name: param.name,
                        units: param.units,
                    },
                });
            }

            // Add new parameters
            for (const param of newParams) {
                await tx.reportParameter.create({
                    data: {
                        name: param.name,
                        units: param.units,
                        reportTypeId: reportId,
                    },
                });
            }

            // Update the report type itself
            await tx.reportType.update({
                where: {id: reportId},
                data: {
                    name: reportForm.name,
                    description: reportForm.description,
                },
            });

            revalidatePath("/admin/reports");
            return {
                success: true,
                message: "Report type updated successfully",
            };
        });
    } catch (e) {
        if (e instanceof Error) {
            return {
                success: false,
                message: e.message,
            };
        }
        return {
            success: false,
            message: "An uncaught error occurred while updating report type",
        };
    }
}

export const deleteReportType = async (reportId: number): Promise<myError> => {
    try {
        await prisma.reportType.delete({
            where: {
                id: reportId,
            },
        });
        revalidatePath("/admin/reports");
        return {success: true, message: "Report type deleted successfully"};
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: "An error occurred while deleting report type",
        };
    }
};

export async function addPatient({
                                     formData,
                                 }: {
    formData: PatientFormData;
}): Promise<myError> {
    try {
        const floatHeight = parseFloat(formData.height);

        const floatWeight = parseFloat(formData.weight);

        if (formData.gender === "") {
            return {success: false, message: "Select a valid Gender"};
        }

        if (!formData.name || !formData.telephone) {
            return {success: false, message: "Please fill all fields"};
        }

        if (formData.telephone.length !== 10) {
            return {success: false, message: "Invalid telephone number"};
        }

        const date = new Date(formData.birthDate);

        if (isNaN(date.getTime())) {
            return {success: false, message: "Invalid birth date"};
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
                gender: formData.gender,
            },
        });

        revalidatePath("/patients");
        return {success: true, message: "Patient added successfully"};
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: "An error occurred while adding patient",
        };
    }
}

export async function updatePatient(
    formData: PatientFormData,
    id: number
): Promise<myError> {
    try {
        const floatHeight = parseFloat(formData.height);
        const floatWeight = parseFloat(formData.weight);

        if (formData.gender === "") {
            return {success: false, message: "Select a valid Gender"};
        }

        if (!formData.name || !formData.telephone) {
            return {success: false, message: "Please fill all fields"};
        }

        const date = new Date(formData.birthDate);

        if (isNaN(date.getTime())) {
            return {success: false, message: "Invalid birth date"};
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
            },
        });

        revalidatePath(`/patients/${id}`);
        return {success: true, message: "Patient updated successfully"};
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: "An error occurred while updating patient",
        };
    }
}

//For adding drugs to the inventory
export async function addNewItem({
                                     formData,
                                 }: {
    formData: InventoryFormData;
}): Promise<myError> {
    try {
        if (!formData.drugId || !formData.brandId || !formData.concentrationId) {
            return {success: false, message: "Please fill all fields"};
        }

        return await prisma.$transaction(async (tx) => {
            // 1. Create or connect drug brand
            const brand = await tx.drugBrand.upsert({
                where: {id: formData.brandId ?? 0},
                update: {},
                create: {
                    name: formData.brandName,
                    description: formData.brandDescription || null,
                },
            });

            // 2. Create or connect drug
            const drug = await tx.drug.upsert({
                where: {id: formData.drugId ?? 0},
                update: {},
                create: {
                    name: formData.drugName,
                },
            });

            // 3. Create batch with both drug and brand relationships
            if (formData.concentrationId === undefined || formData.concentration === undefined) {
                return {success: false, message: "Please select a concentration"};
            }

            let newConcentrationId: number;

            if (formData.concentrationId === -1) {
                const newConcentration = await tx.unitConcentration.upsert({
                    where: {concentration: formData.concentration},
                    update: {},
                    create: {
                        concentration: formData.concentration,
                    },
                })
                newConcentrationId = newConcentration.id;
            } else {
                newConcentrationId = formData.concentrationId;
            }

            await tx.batch.create({
                data: {
                    number: formData.batchNumber,
                    drug: {
                        connect: {id: drug.id},
                    },
                    drugBrand: {
                        connect: {id: brand.id},
                    },
                    type: formData.drugType as DrugType,
                    fullAmount: parseFloat(formData.quantity.toString()),
                    remainingQuantity: parseFloat(formData.quantity.toString()),
                    expiry: new Date(formData.expiry),
                    retailPrice: parseFloat(formData.retailPrice.toString()),
                    wholesalePrice: parseFloat(
                        formData.wholesalePrice.toString()
                    ),
                    unitConcentration: {
                        connect: {id: newConcentrationId},
                    },
                    status: "AVAILABLE",
                },
            });

            revalidatePath("/inventory/available-stocks");
            return {success: true, message: "Item added successfully"};
        });
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        return {success: false, message: "Failed to add item"};
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
            throw new Error("Batch not found");
        }

        return {
            number: batchData.number,
            drugName: batchData.drug.name,
            drugBrandName: batchData.drugBrand.name,
            drugType: batchData.type,
            fullAmount: batchData.fullAmount,
            remainingQuantity: batchData.remainingQuantity,
            expiryDate: batchData.expiry.toISOString().split("T")[0], // Format to 'YYYY-MM-DD'
            stockDate: batchData.stockDate.toISOString().split("T")[0], // Format to 'YYYY-MM-DD'
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

export async function handleConfirmationOfBatchStatusChange(
    batchId: number,
    action: "completed" | "trashed"
): Promise<myError> {
    if (!batchId) return {success: false, message: "Batch ID not provided"};

    const newStatus = action === "completed" ? "COMPLETED" : "TRASHED";

    try {
        await prisma.batch.update({
            where: {id: batchId},
            data: {status: newStatus},
        });

        return {success: true, message: "Batch status updated successfully"};
    } catch (error) {
        console.error("Error updating batch status:", error);
        return {success: false, message: "An error occurred while updating batch status"};
    }
}

// Fetch functions for brand, drug, and batch data
export async function getBrandName(id: number): Promise<string> {
    try {
        const brand = await prisma.drugBrand.findUnique({
            where: {id},
            select: {name: true},
        });
        return brand?.name || `Brand-${id}`;
    } catch (error) {
        console.error("Error fetching brand name:", error);
        return `Brand-${id}`;
    }
}

export async function getDrugName(id: number): Promise<string> {
    try {
        const drug = await prisma.drug.findUnique({
            where: {id},
            select: {name: true},
        });
        return drug?.name || `Drug-${id}`;
    } catch (error) {
        console.error("Error fetching drug name:", error);
        return `Drug-${id}`;
    }
}

export async function getBatchNumber(id: number): Promise<string> {
    try {
        const batch = await prisma.batch.findUnique({
            where: {id},
            select: {number: true},
        });
        return batch?.number || `Batch-${id}`;
    } catch (error) {
        console.error("Error fetching batch number:", error);
        return `Batch-${id}`;
    }
}

export async function getPatientReportPages(
    query: string,
    range: string,
    id: number
) {
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
                name: {contains: query, mode: "insensitive"},
            },
            ...dateFilter,
        },
    });
}

export async function getPatientReports(
    query: string,
    range: string,
    PatientId: number,
    page: number
) {
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
                    name: {contains: query, mode: "insensitive"},
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
                    },
                },
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
            patientId: id,
        },
    });
}

export const searchReportTypes = async (query: string) => {
    return prisma.reportType.findMany({
        where: {
            name: {
                startsWith: query,
                mode: "insensitive",
            },
        },
        select: {
            name: true,
            id: true,
        },
        take: 10,
    });
};

export const getReportParams = async (id: number) => {
    return prisma.reportParameter.findMany({
        where: {
            reportTypeId: id,
        },
        select: {
            id: true,
            name: true,
            units: true,
        },
    });
};

export async function addPatientReport({
                                           patientID,
                                           reportTypeID,
                                           params,
                                       }: {
    patientID: number;
    reportTypeID: number;
    params: Record<number, { value: string; attention: boolean }>;
}): Promise<myError> {
    try {
        const reportType = await prisma.reportType.findUnique({
            where: {id: reportTypeID},
        });

        if (!reportType) {
            return {success: false, message: "Report type not found"};
        }

        // check if all params have empty values
        if (Object.values(params).every((param) => param.value === "")) {
            return {
                success: false,
                message: "Please fill at least one parameter",
            };
        }

        await prisma.patientReport.create({
            data: {
                patientId: patientID,
                reportTypeId: reportTypeID,
                parameters: {
                    create: Object.entries(params).map(([key, param]) => ({
                        reportParameterId: parseInt(key, 10),
                        value: param.value,
                        attention: param.attention,
                    })),
                },
            },
        });

        revalidatePath(`/patients/${patientID}/reports`);
        return {success: true, message: "Report added successfully"};
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: "An error occurred while adding report",
        };
    }
}

export async function deletePatientReport(
    reportId: number,
    patientID: number
): Promise<myError> {
    try {
        await prisma.patientReport.delete({
            where: {
                id: reportId,
            },
        });

        revalidatePath(`/patients/${patientID}/reports`);
        return {success: true, message: "Report deleted successfully"};
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: "An error occurred while deleting report",
        };
    }
}

export async function getPendingPatientsCount() {
    const session = await verifySession();

    return prisma.queueEntry.count({
        where: {
            status:
                session.role === "DOCTOR" ? "PENDING" : {not: "COMPLETED"},
        },
    });
}

const PAGE_SIZE = 10;

// Helper function to apply sorting
function applySorting(
    data: StockData[],
    sort: SortOption = "alphabetically"
): StockData[] {
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
export async function getAvailableDrugsTotalPages(
    query: string,
    selection: string
): Promise<number> {
    let count = 0;

    switch (selection) {
        case "brand":
            count = await prisma.drugBrand.count({
                where: {
                    name: {contains: query, mode: "insensitive"},
                    Batch: {some: {status: "AVAILABLE"}},
                },
            });
            break;
        case "model":
            count = await prisma.drug.count({
                where: {
                    name: {contains: query, mode: "insensitive"},
                    batch: {some: {status: "AVAILABLE"}},
                },
            });
            break;
        case "batch":
            count = await prisma.batch.count({
                where: {
                    OR: [
                        {drug: {name: {contains: query, mode: "insensitive"}}},
                        {drugBrand: {name: {contains: query, mode: "insensitive"}}},
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
                                          endDate,
                                      }: StockQueryParams): Promise<StockData[]> {
    const drugs = await prisma.drug.findMany({
        where: {
            name: {contains: query, mode: "insensitive"},
            batch: {
                some: {
                    // status: "AVAILABLE",
                    ...(startDate && endDate
                        ? {
                            stockDate: {
                                gte: startDate,
                                lte: endDate,
                            },
                        }
                        : {}),
                },
            },
        },
        include: {
            batch: {
                where: {
                    // status: "AVAILABLE",
                    ...(startDate && endDate
                        ? {
                            stockDate: {
                                gte: startDate,
                                lte: endDate,
                            },
                        }
                        : {}),
                },
                select: {
                    wholesalePrice: true,
                    retailPrice: true,
                    remainingQuantity: true,
                },
            },
        },
    });

    const stockData: StockData[] = drugs.map((drug) => ({
        id: drug.id,
        name: drug.name,
        totalPrice: drug.batch.reduce(
            (
                sum: number,
                batch: { retailPrice: number; remainingQuantity: number }
            ) => sum + batch.retailPrice * batch.remainingQuantity,
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
                {drug: {name: {contains: query, mode: "insensitive"}}},
                {drugBrand: {name: {contains: query, mode: "insensitive"}}},
            ],
            // status: "AVAILABLE",
            ...(startDate && endDate
                ? {
                    stockDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                }
                : {}),
        },
        include: {
            drug: true,
            drugBrand: true,
        },
    });

    const stockData: StockData[] = batches.map((batch) => ({
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
            name: {contains: query, mode: "insensitive"},
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
        .filter((brand) => brand.Batch.length > 0) // Only include brands with matching batches
        .map((brand) => ({
            id: brand.id,
            name: brand.name,
            totalPrice: brand.Batch.reduce(
                (sum, batch) =>
                    sum + batch.retailPrice * batch.remainingQuantity,
                0
            ),
        }));

    const sortedData = applySorting(stockData, sort as SortOption);
    return sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

export async function getStockAnalysis(
    dateRange: DateRange
): Promise<StockAnalysis> {
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
            available: 0, // Will store available quantity value
            sold: 0, // Will store sold quantity value
            expired: 0, // Will store expired quantity value
            trashed: 0, // Will store trashed quantity value
            errors: 0, // Will store error quantity value
        };

        batches.forEach((batch) => {
            const pricePerUnit = batch.retailPrice;

            switch (batch.status) {
                case "AVAILABLE":
                    // For available status:
                    // - available = remainingQuantity * price
                    // - sold = (fullAmount - remainingQuantity) * price
                    analysis.available +=
                        batch.remainingQuantity * pricePerUnit;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        analysis.sold +=
                            (batch.fullAmount - batch.remainingQuantity) *
                            pricePerUnit;
                    }
                    break;

                case "EXPIRED":
                    // For expired status:
                    // - expired = remainingQuantity * price
                    // - sold = (fullAmount - remainingQuantity) * price
                    analysis.expired += batch.remainingQuantity * pricePerUnit;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        analysis.sold +=
                            (batch.fullAmount - batch.remainingQuantity) *
                            pricePerUnit;
                    }
                    break;

                case "COMPLETED":
                    // For completed status:
                    // - If there's remaining quantity, it's an error
                    // - sold = (fullAmount - remainingQuantity) * price
                    if (batch.remainingQuantity > 0) {
                        analysis.errors +=
                            batch.remainingQuantity * pricePerUnit;
                    }
                    analysis.sold +=
                        (batch.fullAmount - batch.remainingQuantity) *
                        pricePerUnit;
                    break;

                case "TRASHED":
                    // For trashed status:
                    // - trashed = remainingQuantity * price
                    // - sold = (fullAmount - remainingQuantity) * price
                    analysis.trashed += batch.remainingQuantity * pricePerUnit;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        analysis.sold +=
                            (batch.fullAmount - batch.remainingQuantity) *
                            pricePerUnit;
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
        drug: {name: {contains: query, mode: "insensitive"}},
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
        drug: {name: {contains: query, mode: "insensitive"}},
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
        drugBrand: {name: {contains: query, mode: "insensitive"}},
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
        drugBrand: {name: {contains: query, mode: "insensitive"}},
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
        number: {contains: query, mode: "insensitive"},
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
        number: {contains: query, mode: "insensitive"},
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

function sortAndPaginateBatches(
    batches: {
        id: number;
        batchNumber: string;
        brandName: string;
        modelName: string;
        expiryDate: string;
        stockDate: string;
        remainingAmount: number;
        fullAmount: number;
        status: string;
    }[],
    sort: string,
    page: number
) {
    if (sort === "expiryDate") {
        batches.sort(
            (a, b) =>
                new Date(a.expiryDate).getTime() -
                new Date(b.expiryDate).getTime()
        );
    } else if (sort === "newlyAdded") {
        batches.sort(
            (a, b) =>
                new Date(b.stockDate).getTime() -
                new Date(a.stockDate).getTime()
        );
    } else if (sort === "alphabetically") {
        batches.sort((a, b) => a.modelName.localeCompare(b.modelName));
    }

    return batches.slice(
        (page - 1) * PAGE_SIZE_COMPLETED_DRUGS_BY_BATCH,
        page * PAGE_SIZE_COMPLETED_DRUGS_BY_BATCH
    );
}

export async function getIssuedPatients(batchId: number) {
    return await prisma.issue
        .findMany({
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
        })
        .then((issues) =>
            issues.map((issue) => ({
                id: issue.id,
                issuedDate: issue.prescription.time.toISOString().split("T")[0],
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
                mode: "insensitive",
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
                mode: "insensitive",
            },
        },
        select: {
            id: true,
            name: true,
        },
        take: 8,
    });
}

export async function getDrugConcentrations(drugId: number): Promise<DrugConcentrationDataSuggestion[]> {
    try {
        const weights = await prisma.batch.findMany({
            where: {
                drugId: drugId
            },
            include: {
                unitConcentration: true
            },
            distinct: ['unitConcentrationId'] // Ensure unique weightIds
        });

        return weights.map(dw => ({
            id: dw.unitConcentration.id,
            concentration: dw.unitConcentration.concentration
        }));
    } catch (error) {
        console.error('Error fetching drug weights:', error);
        throw new Error('Failed to fetch drug weights');
    }
}

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

        batches.forEach((batch) => {
            switch (batch.status) {
                case "AVAILABLE":
                    stats.available.quantity += batch.remainingQuantity;
                    stats.available.value +=
                        batch.retailPrice * batch.remainingQuantity;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        stats.sold.quantity +=
                            batch.fullAmount - batch.remainingQuantity;
                        stats.sold.value +=
                            (batch.fullAmount - batch.remainingQuantity) *
                            batch.retailPrice;
                    }
                    break;

                case "EXPIRED":
                    stats.expired.quantity += batch.remainingQuantity;
                    stats.expired.value +=
                        batch.retailPrice * batch.remainingQuantity;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        stats.sold.quantity +=
                            batch.fullAmount - batch.remainingQuantity;
                        stats.sold.value +=
                            (batch.fullAmount - batch.remainingQuantity) *
                            batch.retailPrice;
                    }
                    break;

                case "COMPLETED":
                    if (batch.remainingQuantity > 0) {
                        stats.errors.quantity += batch.remainingQuantity;
                        stats.errors.value +=
                            batch.remainingQuantity * batch.retailPrice;
                    }
                    stats.sold.quantity +=
                        batch.fullAmount - batch.remainingQuantity;
                    stats.sold.value +=
                        (batch.fullAmount - batch.remainingQuantity) *
                        batch.retailPrice;
                    break;
                case "TRASHED":
                    stats.trashed.quantity += batch.remainingQuantity;
                    stats.trashed.value +=
                        batch.remainingQuantity * batch.retailPrice;
                    if (batch.fullAmount > batch.remainingQuantity) {
                        stats.sold.value +=
                            (batch.fullAmount - batch.remainingQuantity) *
                            batch.retailPrice;
                        stats.sold.quantity +=
                            batch.fullAmount - batch.remainingQuantity;
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