'use server';

import {revalidatePath} from "next/cache";
import type {myError} from "@/app/lib/definitions";
import {InventoryFormData, PatientFormData} from "@/app/lib/definitions";
import {prisma} from "./prisma";
import {verifySession} from "./sessions";
import bcrypt from "bcryptjs";
import {DrugType, Prisma} from "@prisma/client";

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

const PAGE_SIZE = 10;

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
                where: {name: formData.brandName},
                update: {},
                create: {
                    name: formData.brandName,
                    description: formData.brandDescription || ''
                }
            });

            // 2. Create or connect drug
            const drug = await tx.drug.upsert({
                where: {name: formData.drugName},
                update: {},
                create: {
                    name: formData.drugName,
                    brandName: brand.name
                }
            });

            // 3. Create batch
            await tx.batch.create({
                data: {
                    number: formData.batchNumber,
                    drugName: drug.name,
                    type: formData.drugType as DrugType,
                    fullAmount: parseFloat(formData.quantity.toString()),
                    remainingQuantity: parseFloat(formData.quantity.toString()),
                    expiry: new Date(formData.expiry),
                    price: parseFloat(formData.price.toString()),
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

export async function searchDrugModal(term: string) {
    return prisma.drug.findMany({
        where: {
            name: {
                startsWith: term
            }
        },
        select: {
            name: true
        }
    })
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