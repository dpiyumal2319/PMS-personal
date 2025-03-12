'use server'

import {myConfirmation, myError} from "@/app/lib/definitions";
import {prisma} from "@/app/lib/prisma";
import {DrugType, Prisma} from "@prisma/client";
import {revalidatePath} from "next/cache";
import {verifySession} from "@/app/lib/sessions";
import {PrescriptionFormData} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/PrescriptionForm";
import {
    BrandOption, CustomDrugType, DrugOption,
    ConcentrationOption
} from "@/app/(dashboard)/patients/[id]/prescriptions/add/_components/IssueFromInventory";
import {VitalFormData} from "@/app/(dashboard)/admin/prescription/_components/AddVitalDialog";
import {redirect} from "next/navigation";

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

export async function getCachedBatch({
                                         drugId,
                                         brandId,
                                         type,
                                         unitConcentrationId
                                     }: {
    drugId: number;
    brandId: number;
    unitConcentrationId: number;
    type: DrugType;
}) {
    return prisma.batchHistory.findUnique({
        where: {
            drugId_drugBrandId_type_unitConcentrationId: {
                unitConcentrationId,
                type,
                drugId,
                drugBrandId: brandId,
            }
        },
        select: {
            batchId: true,
        },
    });
}

export async function getBatches({
                                     drugID,
                                     brandID,
                                     type,
                                     concentrationID,
                                 }: {
    drugID: number;
    brandID: number;
    type: DrugType;
    concentrationID: number;
}) {
    return prisma.batch.findMany({
        where: {
            drugId: drugID,
            drugBrandId: brandID,
            status: "AVAILABLE",
            type: type,
            unitConcentrationId: concentrationID,
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
                    unitConcentration: true,
                },
            },
            OffRecordMeds: true,
            ...(session.role === "DOCTOR"
                ? {
                    PrescriptionVitals: {
                        include: {
                            vital: true,
                        },
                    },
                }
                : {}),
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
    let select: Prisma.PrescriptionSelect = {};
    const session = await verifySession();

    if (query) {
        if (filter === "symptom") {
            where = {
                presentingSymptoms: {
                    contains: query,
                    mode: 'insensitive',
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
                                        mode: 'insensitive',
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
                                    mode: 'insensitive',
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

    if (session.role === 'DOCTOR') {
        select = {
            PrescriptionVitals: {
                select: {
                    value: true,
                    vital: {
                        select: {
                            color: true,
                            icon: true,
                            name: true,
                        }
                    },
                },
            },
        }
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
        select: {
            id: true,
            time: true,
            presentingSymptoms: true,
            details: true,
            status: true,
            issues: {
                select: {
                    drug: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            OffRecordMeds: {
                select: {
                    name: true,
                },
            },
            ...select,
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
                    mode: 'insensitive',
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
                                        mode: 'insensitive',
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
                                    mode: 'insensitive',
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

        const session = await verifySession();
        if (session.role !== "DOCTOR") {
            redirect('/unauthorized');
        }

        // Remove '' vitals
        prescriptionForm.vitals = prescriptionForm.vitals.filter(
            (vital) => vital.value !== ""
        );

        // Create prescription with all related records in a transaction
        await prisma.$transaction(async (tx) => {
            // Create the main prescription and store its result to get issue IDs
            const prescription = await tx.prescription.create({
                data: {
                    patientId: patientID,
                    presentingSymptoms: prescriptionForm.presentingSymptoms,
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
                            quantity: issue.quantity,
                            meal: issue.meal,
                            dose: issue.dose,
                            type: issue.drugType,
                            unitConcentrationId: issue.concentrationID,
                        })),
                    },
                    // Create off-record medications
                    OffRecordMeds: {
                        create: prescriptionForm.offRecordMeds.map((med) => ({
                            name: med.name,
                            description: med.description,
                        })),
                    },
                    //  Create vitals
                    PrescriptionVitals: {
                        create: prescriptionForm.vitals.map((vital) => ({
                            vitalId: vital.id,
                            value: vital.value,
                        })),
                    },
                },
                // Include the created issues in the return value
                include: {
                    issues: true,
                },
            });

            //Check for queue entry
            const queueEntry = await tx.queueEntry.findFirst({
                where: {
                    patientId: patientID,
                    status: "PENDING",
                },
            });


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
                            issueId: createdIssue.id,
                        },
                        create: {
                            drugId: issue.drugId,
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
                    unitConcentrationId: true,
                    type: true,
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
            status: 'AVAILABLE',
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
            status: 'AVAILABLE',
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

export async function getAllVitals() {
    return prisma.vitals.findMany({
        orderBy: {
            id: "asc",
        }
    });
}

export async function getPatientSpecificVitals(patientID: number) {
    // Fetch the patient to get their gender
    const patient = await prisma.patient.findUnique({
        where: {
            id: patientID,
        }
    });

    if (!patient) {
        throw new Error("Patient not found");
    }

    return prisma.vitals.findMany({
        where: {
            OR: [
                {forGender: null}, // Include vitals with no gender restriction
                {forGender: patient.gender}, // Include vitals specific to the patient's gender
            ],
        },
        orderBy: {
            id: "asc",
        }
    });
}

export async function addVital(vital: VitalFormData): Promise<myError> {


    if (!vital.name || !vital.icon || !vital.color || !vital.placeholder) {
        return {
            success: false,
            message: "All fields are required",
        };
    }

    const session = await verifySession();
    if (session.role !== 'DOCTOR') {
        redirect('/unauthorized');
    }

    const extVital = await prisma.vitals.findMany({
        where: {
            name: {
                equals: vital.name,
                mode: 'insensitive',
            }
        },
    })

    if (extVital.length > 0) {
        return {
            success: false,
            message: "Vital already exists",
        };
    }

    await prisma.vitals.create({
        data: {
            icon: vital.icon,
            color: vital.color,
            name: vital.name,
            placeholder: vital.placeholder,
            forGender: vital.forGender,
            type: vital.type
        }
    });

    revalidatePath('/admin/prescription');
    return {
        success: true,
        message: "Vital added successfully",
    };
}

export async function updateVital(vital: VitalFormData): Promise<myError> {
    if (!vital.id || !vital.name || !vital.icon || !vital.color || !vital.placeholder) {
        return {
            success: false,
            message: "All fields are required",
        };
    }

    const session = await verifySession();
    if (session.role !== 'DOCTOR') {
        redirect('/unauthorized');
    }

    // check if type changed
    const extVital = await prisma.vitals.findUnique({
        where: {
            id: vital.id, // Ensure `vital.id` is a valid integer
        },
        include: {
            _count: {
                select: {
                    PrescriptionVitals: true,
                },
            },
        },
    });

    if (!extVital) {
        return {
            success: false,
            message: "Vital not found",
        };
    } else {
        if (extVital.type !== vital.type) {
            if (extVital._count.PrescriptionVitals > 0) {
                return {
                    success: false,
                    message: "Vital type cannot be changed as it is already in use",
                };
            }
        }
    }


    await prisma.vitals.update({
        where: {
            id: vital.id
        },
        data: {
            icon: vital.icon,
            color: vital.color,
            name: vital.name,
            placeholder: vital.placeholder,
            forGender: vital.forGender,
            type: vital.type
        }
    });

    revalidatePath('/admin/prescription');
    return {
        success: true,
        message: "Vital updated successfully",
    };
}


export async function safeDeleteVital(vitalID: number): Promise<myError | myConfirmation> {
    const session = await verifySession();
    if (session.role !== 'DOCTOR') {
        redirect('/unauthorized');
    }

    const extVital = await prisma.vitals.findUnique({
        where: {
            id: vitalID,
        },
        include: {
            _count: {
                select: {
                    PrescriptionVitals: true,
                },
            },
        },
    });

    if (!extVital) {
        return {
            success: false,
            message: "Vital not found",
        };
    }

    if (extVital._count.PrescriptionVitals > 0) {
        return {
            confirmationRequired: true,
            message: `Vital is in use in ${extVital._count.PrescriptionVitals} prescriptions. Are you sure you want to delete it with all its data?`,
        }
    }

    await prisma.vitals.delete({
        where: {
            id: vitalID,
        },
    });

    revalidatePath('/admin/prescription');
    return {
        success: true,
        message: "Vital deleted successfully",
    };
}

export async function deleteVital(vitalID: number): Promise<myError> {
    const session = await verifySession();
    if (session.role !== 'DOCTOR') {
        redirect('/unauthorized');
    }

    try {
        await prisma.vitals.delete({
            where: {
                id: vitalID,
            },
        });

        revalidatePath('/admin/prescription');
        return {
            success: true,
            message: "Vital deleted successfully",
        };
    } catch (e) {
        console.error("Error deleting vital:", e);
        return {
            success: false,
            message: "An error occurred while deleting vital",
        };
    }
}