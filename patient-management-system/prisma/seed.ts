import {PrismaClient, Gender, Role, QueueStatus, VisitStatus} from '@prisma/client';
import {faker} from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    //Add two patients
    const patient1 = await prisma.patient.create({
        data: {
            telephone: '0771234567',
            name: 'Kasun Perera',
            birthDate: new Date('1990-05-15'),
            address: 'Colombo, Sri Lanka',
            height: 175,
            weight: 70,
            gender: Gender.MALE,
            NIC: '199056789V',
        },
    });

    const patient2 = await prisma.patient.create({
        data: {
            telephone: '0719876543',
            name: 'Nimal Rajapaksa',
            birthDate: new Date('1985-08-21'),
            address: 'Kandy, Sri Lanka',
            height: 168,
            weight: 68,
            gender: Gender.MALE,
            NIC: '198578954V',
        },
    });

    // Generate 50 random patients
    const patients = Array.from({length: 50}).map(() => ({
        telephone: faker.phone.number({
            style: 'national',
        }),
        name: faker.person.fullName(),
        birthDate: faker.date.birthdate({min: 18, max: 80, mode: 'age'}),
        address: `${faker.location.city()}, Sri Lanka`,
        height: faker.number.int({min: 150, max: 190}),
        weight: faker.number.int({min: 50, max: 100}),
        gender: faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]),
        NIC: `${faker.number.int({min: 190000000, max: 209999999})}V`,
    }));

    // Insert the random patients into the database
    await prisma.patient.createMany({data: patients});

    //Add doctor and nurse
    await prisma.user.create({
        data: {
            email: 'doctor1@srilanka.com',
            mobile: '0765432189',
            password: '$2a$10$uQpRRBUzSZWg6vqcVHE3HeDiuN5aJcvM5dXaU.IBnFNYuaxniCE.a',
            role: Role.DOCTOR,
            name: 'Dr. Pubudu'
        },
    });

    await prisma.user.create({
        data: {
            email: 'nurse1@srilanka.com',
            mobile: '0775671234',
            password: '$2a$10$uQpRRBUzSZWg6vqcVHE3HeDiuN5aJcvM5dXaU.IBnFNYuaxniCE.a',
            role: Role.NURSE,
            name: 'Pubudu Nona'
        },
    });

    await prisma.user.create({
        data: {
            email: 'nurse2@srilanka.com',
            mobile: '0775677890',
            password: '$2a$10$uQpRRBUzSZWg6vqcVHE3HeDiuN5aJcvM5dXaU.IBnFNYuaxniCE.a',
            role: Role.NURSE,
            name: 'Dasun Nona'
        },
    });

    // Create a Queue
    const queue = await prisma.queue.create({
        data: {
            start: new Date(),
            status: QueueStatus.IN_PROGRESS,
        },
    });

    // Create Queue Entries
    await prisma.queueEntry.createMany({
        data: [
            {queueId: queue.id, status: VisitStatus.PENDING, patientId: patient1.id, token: 1},
            {queueId: queue.id, status: VisitStatus.COMPLETED, patientId: patient2.id, token: 2},
            {queueId: queue.id, status: VisitStatus.PRESCRIBED, patientId: patient1.id, token: 3},
        ],
    });

    await prisma.drug.createMany({
        data: [
            {name: 'Paracetamol'},
            {name: 'Brufen'},
            {name: 'Amoxil'},
        ]
    })

    // Add Drugs
    await prisma.drugBrand.create({
        data: {
            name: 'Penadol',
            description: 'Pain relief tablet',
            Batch: {
                create: [{
                    number: 'B123',
                    type: 'Tablet',
                    fullAmount: 100,
                    expiry: new Date('2025-12-01'),
                    remainingQuantity: 100,
                    price: 50,
                    status: 'AVAILABLE',
                    drugId: 1
                }]
            }
        }
    });

    await prisma.drugBrand.create({
        data: {
            name: 'Penadene',
            description: 'Pain relief tablet',
            Batch: {
                create: [{
                    number: 'B3456',
                    type: 'Tablet',
                    fullAmount: 100,
                    expiry: new Date('2025-12-10'),
                    remainingQuantity: 80,
                    price: 40,
                    status: 'AVAILABLE',
                    drugId: 1
                }]
            }
        }
    });

    await prisma.drugBrand.create({
        data: {
            name: 'Ibuprofen',
            description: 'Anti-inflammatory pain reliever',
            Batch: {
                create: [{
                    number: 'B456',
                    type: 'Tablet',
                    fullAmount: 200,
                    expiry: new Date('2026-06-15'),
                    remainingQuantity: 200,
                    price: 80,
                    status: 'AVAILABLE',
                    drugId: 2
                }]
            }
        }
    });

    await prisma.drugBrand.create({
        data: {
            name: 'Amoxicillin',
            description: 'Antibiotic for bacterial infections',
            Batch: {
                create: [{
                    number: 'B789',
                    type: 'Tablet',
                    fullAmount: 150,
                    expiry: new Date('2025-09-30'),
                    remainingQuantity: 150,
                    price: 120,
                    status: 'AVAILABLE',
                    drugId: 3
                }]
            }
        }
    });


    // Add Reports
    const fbcReport = await prisma.reportType.create({
        data: {
            name: "Full Blood Count",
            description: "A full blood count (FBC) is a common blood test that measures the number and status of different types of blood cells.",
            parameters: {
                create: [
                    {name: "Hemoglobin", units: "g/dL"},
                    {name: "WBC Count", units: "cells/µL"},
                ],
            },
        },
    });

    const lftReport = await prisma.reportType.create({
        data: {
            name: "Liver Function Test",
            description: "A liver function test is a blood test that checks your liver function.",
            parameters: {
                create: [
                    {name: "ALT", units: "U/L"},
                    {name: "AST", units: "U/L"},
                ],
            },
        },
    });

    const report1 = await prisma.patientReport.create({
        data: {
            patientId: patient1.id,
            reportTypeId: fbcReport.id,
            time: new Date(),
        },
    });

    const report2 = await prisma.patientReport.create({
        data: {
            patientId: patient1.id,
            reportTypeId: lftReport.id,
            time: new Date(),
        },
    });

    await prisma.reportValue.create({
        data: {
            patientReportId: report1.id,
            reportParameterId: 1,
            value: "12.5"
        }
    })

    await prisma.reportValue.create({
        data: {
            patientReportId: report1.id,
            reportParameterId: 2,
            value: "5000"
        }
    })

    await prisma.reportValue.create({
        data: {
            patientReportId: report2.id,
            reportParameterId: 3,
            value: "50"
        }
    })

    await prisma.reportValue.create({
        data: {
            patientReportId: report2.id,
            reportParameterId: 4,
            value: "40"
        }
    })

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });