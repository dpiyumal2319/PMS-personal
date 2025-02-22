'use server'

import {myError} from "@/app/lib/definitions";
import {prisma} from "@/app/lib/prisma";
import {ChargeType, Prisma} from "@prisma/client";
import type {DrugType} from "@prisma/client";
import {revalidatePath} from "next/cache";
import {verifySession} from "@/app/lib/sessions";
import {PrescriptionFormData} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";
import {
    BrandOption, CustomDrugType, DrugOption,
    ConcentrationOption
} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/IssueFromInventory";

export async function completePrescription(
    prescriptionID: number
): Promise<myError> {
    try {
        const prescription = await prisma.prescription.findUnique({
            where: {id: prescriptionID},
            include: {
                issues: {
                    include: {
                        batch: true,
                    },
                },
            },
        });

        if (!prescription) {
            return {success: false, message: "Prescription not found"};
        }

        if (prescription.status === "COMPLETED") {
            return {
                success: false,
                message: "Prescription already completed",
            };
        }

        if (!prescription.issues.every((issue) => issue.batch)) {
            return {success: false, message: "Prescription not completed"};
        }

        // Updating remaining quantity of batches
        await prisma.$transaction(async (prisma) => {
            for (let i = 0; i < prescription.issues.length; i++) {
                const issue = prescription.issues[i];
                if (!issue.batch || !issue.batchId) {
                    return {
                        success: false,
                        message: "Batch not found for a drug",
                    };
                }
                await prisma.batch.update({
                    where: {id: issue.batchId},
                    data: {
                        remainingQuantity: {
                            decrement: issue.quantity,
                        },
                    },
                });
            }

            await prisma.prescription.update({
                where: {id: prescriptionID},
                data: {status: "COMPLETED"},
            });

            //Check for queue entry
            const queueEntry = await prisma.queueEntry.findFirst({
                where: {
                    patientId: prescription.patientId,
                    status: "PRESCRIBED",
                },
            });

            if (queueEntry) {
                await prisma.queueEntry.update({
                    where: {
                        id: queueEntry.id,
                    },
                    data: {
                        status: "COMPLETED",
                    },
                });
                revalidatePath(`/queue/${queueEntry.id}`);
            }
        });
        revalidatePath(`/patients/${prescription.patientId}/prescriptions`);
        return {
            success: true,
            message: "Prescription completed successfully",
        };
    } catch (error) {
        console.error("Error completing prescription:", error);
        return {
            success: false,
            message: "An error occurred while completing prescription",
        };
    }
}

export async function getCharges() {
    return prisma.charge.findMany({
        where: {
            OR: [{name: ChargeType.DISPENSARY}, {name: ChargeType.DOCTOR}],
        },
    });
}

export async function getCachedBatch({
                                         drugId,
                                         brandId,
                                     }: {
    drugId: number;
    brandId: number;
}) {
    return prisma.batchHistory.findUnique({
        where: {
            drugId_drugBrandId: {
                drugId,
                drugBrandId: brandId,
            },
        },
        select: {
            batchId: true,
        },
    });
}

export async function getBatches({
                                     drugID,
                                     brandID,
                                 }: {
    drugID: number;
    brandID: number;
}) {
    return prisma.batch.findMany({
        where: {
            drugId: drugID,
            drugBrandId: brandID,
            status: "AVAILABLE",
        },
        select: {
            id: true,
            number: true,
            remainingQuantity: true,
            expiry: true,
        },
    });
}

export async function getPrescription(
    prescriptionID: number,
    patientID: number
) {
    const session = await verifySession();
    return prisma.prescription.findUnique({
        where: {
            id: prescriptionID,
            patientId: patientID,
            ...(session.role !== "DOCTOR" && {status: "PENDING"}),
        },
        include: {
            issues: {
                include: {
                    drug: true,
                    brand: true,
                    batch: true,
                },
            },
            OffRecordMeds: true,
        },
    });
}

//For prescriptions page
export async function getPrescriptionsCount(patientID: number) {
    return prisma.prescription.count({
        where: {
            patientId: patientID,
        },
    });
}

export async function searchPrescriptions({
                                              patientID,
                                              query,
                                              filter,
                                              take,
                                              skip,
                                          }: {
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
                    contains: query,
                },
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
                                        contains: query,
                                    },
                                },
                            },
                        },
                    },
                    {
                        OffRecordMeds: {
                            some: {
                                name: {
                                    contains: query,
                                },
                            },
                        },
                    },
                ],
            };
        }
    }

    // Only pending prescriptions can be viewed by non-doctor users
    if (session.role !== "DOCTOR") {
        where = {
            ...where,
            status: "PENDING",
        };
    }

    return prisma.prescription.findMany({
        where: {
            patientId: patientID,
            ...where,
        },
        take,
        skip,
        orderBy: {
            time: "desc",
        },
        include: {
            issues: {
                include: {
                    drug: true,
                },
            },
            OffRecordMeds: {
                select: {
                    name: true,
                },
            },
        },
    });
}

export async function searchPrescriptionCount({
                                                  patientID,
                                                  query,
                                                  filter,
                                              }: {
    patientID: number;
    query: string;
    filter: string;
}) {
    let where = {};

    if (query) {
        if (filter === "symptom") {
            where = {
                presentingSymptoms: {
                    contains: query,
                },
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
                                        contains: query,
                                    },
                                },
                            },
                        },
                    },
                    {
                        OffRecordMeds: {
                            some: {
                                name: {
                                    contains: query,
                                },
                            },
                        },
                    },
                ],
            };
        }
    }

    return prisma.prescription.count({
        where: {
            patientId: patientID,
            ...where,
        },
    });
}

export async function addPrescription({
                                          prescriptionForm,
                                          patientID,
                                      }: {
    prescriptionForm: PrescriptionFormData;
    patientID: number;
}): Promise<myError> {
    try {
        // Basic validation checks
        if (
            prescriptionForm.issues.length === 0 &&
            prescriptionForm.offRecordMeds.length === 0
        ) {
            return {
                success: false,
                message: "At least one prescription is required",
            };
        }

        // check for repeated drugs
        const drugIds = prescriptionForm.issues.map((issue) => issue.drugId);
        const uniqueDrugIds = new Set(drugIds);
        if (drugIds.length !== uniqueDrugIds.size) {
            return {
                success: false,
                message:
                    "Repeated drugs are not allowed in a single prescription",
            };
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
                    status: "PENDING",
                    extraDoctorCharge: Number(
                        prescriptionForm.extraDoctorCharges
                    ),
                    // Create issues
                    issues: {
                        create: prescriptionForm.issues.map((issue) => ({
                            drugId: issue.drugId,
                            details: issue.details,
                            brandId: issue.brandId,
                            strategy: issue.strategy,
                            strategyDetails: issue.strategyDetails,
                            quantity: issue.quantity,
                        })),
                    },
                    // Create off-record medications
                    OffRecordMeds: {
                        create: prescriptionForm.offRecordMeds.map((med) => ({
                            name: med.name,
                            description: med.description,
                        })),
                    },
                },
                // Include the created issues in the return value
                include: {
                    issues: true,
                },
            });

            //Check for queue entry
            console.log(patientID);
            const queueEntry = await tx.queueEntry.findFirst({
                where: {
                    patientId: patientID,
                    status: "PENDING",
                },
            });

            console.log(queueEntry);

            if (queueEntry) {
                revalidatePath(`/queue/${queueEntry.id}`);
                await tx.queueEntry.update({
                    where: {
                        id: queueEntry.id,
                    },
                    data: {
                        status: "PRESCRIBED",
                    },
                });
            }

            // Update strategy history for each issue
            await Promise.all(
                prescriptionForm.issues.map((issue, index) => {
                    const createdIssue = prescription.issues[index]; // Get the corresponding created issue

                    return tx.stratergyHistory.upsert({
                        where: {
                            drugId: issue.drugId,
                        },
                        update: {
                            brandId: issue.brandId,
                            issueId: createdIssue.id,
                        },
                        create: {
                            drugId: issue.drugId,
                            brandId: issue.brandId,
                            issueId: createdIssue.id,
                        },
                    });
                })
            );
        });

        revalidatePath(`/patients/${patientID}/prescriptions`);
        return {
            success: true,
            message: "Prescription created successfully",
        };
    } catch (e) {
        console.error("Error adding prescription:", e);
        return {
            success: false,
            message:
                e instanceof Error
                    ? e.message
                    : "An error occurred while adding prescription",
        };
    }
}

export async function getCachedStrategy(drugID: number) {
    return prisma.stratergyHistory.findUnique({
        where: {
            drugId: drugID,
        },
        select: {
            issueId: true,
            issue: {
                select: {
                    strategy: true,
                    brandId: true,
                    dose: true,
                    meal: true,
                    details: true,
                    quantity: true,
                    batch: {
                        select: {
                            id: true,
                            type: true,
                            unitConcentrationId: true,
                        }
                    }
                }
            }
        },
    });
}

export async function searchAvailableDrugs(term: string): Promise<DrugOption[]> {
    return prisma.drug
        .findMany({
            where: {
                name: {
                    startsWith: term,
                    mode: "insensitive",
                },
                batch: {
                    some: {
                        status: "AVAILABLE",
                    },
                },
            },
            take: 10,
            select: {
                id: true,
                name: true,
                batch: {
                    where: {
                        status: "AVAILABLE",
                    },
                    select: {
                        unitConcentrationId: true,
                    },
                },
            },
        })
        .then((drugs) =>
            drugs.map((drug) => ({
                id: drug.id,
                name: drug.name,
                concentrationCount: new Set(drug.batch.map((b) => b.unitConcentrationId)).size, // Count unique concentrations
            }))
        );
}


export async function searchBrandByDrug({
                                            drugID,
                                        }: {
    drugID: number;
}): Promise<BrandOption[]> {
    return prisma.drugBrand
        .findMany({
            where: {
                Batch: {
                    some: {
                        status: "AVAILABLE",
                        drugId: drugID,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                Batch: {
                    where: {
                        status: "AVAILABLE",
                        drugId: drugID,
                    },
                    select: {
                        remainingQuantity: true,
                        expiry: true,
                        type: true,
                    },
                },
            },
        })
        .then((brands) =>
            brands.map((brand) => {
                const batchCount = brand.Batch.length;
                const totalRemainingQuantity = brand.Batch.reduce(
                    (sum, batch) => sum + batch.remainingQuantity,
                    0
                );
                const farthestExpiry = brand.Batch.reduce(
                    (maxDate, batch) =>
                        batch.expiry > maxDate ? batch.expiry : maxDate,
                    new Date(0) // Initialize with the oldest possible date
                );
                return {
                    id: brand.id,
                    name: brand.name,
                    batchCount,
                    totalRemainingQuantity,
                    farthestExpiry,
                };
            })
        );
}

export async function getConcentrationByDrug({
                                                 drugID,
                                                 type
                                             }: {
    drugID: number;
    type: DrugType;
}): Promise<ConcentrationOption[]> {
    const results = await prisma.batch.groupBy({
        by: ['unitConcentrationId'],
        where: {
            drugId: drugID,
            type: type,
        },
        _max: {
            expiry: true,
        },
        _count: {
            drugBrandId: true,
        },
        _sum: {
            remainingQuantity: true,
        },
    });

    const concentrations = await prisma.unitConcentration.findMany({
        where: {
            id: {in: results.map(r => r.unitConcentrationId)}
        },
        select: {
            id: true,
            concentration: true,
        }
    });

    return results.map(result => {
        const concentration = concentrations.find(c => c.id === result.unitConcentrationId);
        return {
            id: result.unitConcentrationId,
            concentration: concentration ? concentration.concentration.toString() : "Unknown",
            brandCount: result._count.drugBrandId,
            totalRemainingQuantity: result._sum.remainingQuantity || 0,
            farthestExpiry: result._max.expiry!,
        };
    });
}


export async function getBrandByDrugConcentrationType({
                                                          drugID,
                                                          concentrationID,
                                                          type,
                                                      }: {
    drugID: number;
    concentrationID: number;
    type: DrugType;
}): Promise<BrandOption[]> {
    const results = await prisma.batch.groupBy({
        by: ['drugBrandId'],
        where: {
            drugId: drugID,
            unitConcentrationId: concentrationID,
            type: type,
        },
        _max: {
            expiry: true,
        },
        _sum: {
            remainingQuantity: true,
        },
        _count: {
            id: true,
        }
    });

    const brands = await prisma.drugBrand.findMany({
        where: {
            id: {in: results.map(r => r.drugBrandId)}
        },
        select: {
            id: true,
            name: true,
        }
    });


    return results.map(result => {
        const brand = brands.find(b => b.id === result.drugBrandId);
        return {
            id: result.drugBrandId,
            name: brand ? brand.name : "Unknown",
            totalRemainingQuantity: result._sum.remainingQuantity || 0,
            batchCount: result._count.id,
            farthestExpiry: result._max.expiry!,
        };
    });
}

export async function getDrugTypesByDrug(drugID: number): Promise<CustomDrugType[]> {
    return prisma.batch.findMany({
        where: {
            drugId: drugID,
            status: 'AVAILABLE'
        },
        distinct: ['type'],
        select: {
            type: true,
        }
    }).then((types) => {
        return types.map((type) => ({
            name: type.type.toString(),
            type: type.type
        }));
    });
}