'use server'

import {
    BatchAssignPayload
} from "@/app/(dashboard)/patients/[id]/prescriptions/[prescriptionID]/_components/BatchAssign";
import {Bill, myBillError} from "@/app/lib/definitions";
import {prisma} from "@/app/lib/prisma";
import {ChargeType, Prisma} from "@prisma/client";

export async function calculateBill({prescriptionData}: {
    prescriptionData: BatchAssignPayload
}): Promise<myBillError> {
    const prescriptionID = prescriptionData.prescriptionID;
    const batchAssignments = prescriptionData.batchAssigns;

    try {
        return await prisma.$transaction(async (prisma): Promise<myBillError> => {
            const prescription = await prisma.prescription.findUnique({
                where: {id: prescriptionID},
                include: {
                    patient: {
                        select: {
                            name: true
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

            let dspFees: number = 0;
            const dispensaryFee = await prisma.charge.findUnique({
                where: {
                    name: ChargeType.DISPENSARY
                }
            });

            if (dispensaryFee) {
                dspFees = dispensaryFee.value;
            }

            let dctFee: number = 0;
            const doctorFee = await prisma.charge.findUnique({
                where: {
                    name: ChargeType.DOCTOR
                }
            });

            if (doctorFee) {
                dctFee = doctorFee.value;
            }

            // Create or update the bill in the database first to get the billID
            const createdBill = await prisma.bill.upsert({
                where: {
                    prescriptionId: prescriptionID
                },
                create: {
                    prescriptionId: prescriptionID,
                    doctorCharge: dctFee + (prescription.extraDoctorCharge ?? 0),
                    dispensaryCharge: dspFees,
                    medicinesCharge: 0 // Will update this later
                },
                update: {
                    doctorCharge: dctFee + (prescription.extraDoctorCharge ?? 0),
                    dispensaryCharge: dspFees,
                    medicinesCharge: 0 // Will update this later
                }
            });

            // Initialize the bill object with the new structure
            const bill: Bill = {
                billID: createdBill.id,
                prescriptionID,
                patientName: prescription.patient.name,
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

            // Update the final medicine charges
            await prisma.bill.update({
                where: {
                    id: createdBill.id
                },
                data: {
                    medicinesCharge: bill.cost
                }
            });

            bill.cost += bill.doctor_charge + bill.dispensary_charge;
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
            patient: {
                select: {
                    name: true
                }
            },
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
        billID: prescription.Bill.id,
        patientName: prescription.patient.name,
        prescriptionID,
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