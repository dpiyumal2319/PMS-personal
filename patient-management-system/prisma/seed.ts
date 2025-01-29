import {PrismaClient, Gender, Role, QueueStatus} from '@prisma/client';

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

    // Create a Queue
    const queue = await prisma.queue.create({
        data: {
            status: QueueStatus.COMPLETED,
        },
    });

    // Create Queue Entries
    await prisma.queueEntry.createMany({
        data: [
            {queueId: queue.id, status: QueueStatus.IN_PROGRESS, patientId: patient1.id},
            {queueId: queue.id, status: QueueStatus.IN_PROGRESS, patientId: patient2.id},
        ],
    });

    // Add Drugs
    await prisma.drugBrand.create({
        data: {
            name: 'Panadol',
            description: 'Pain relief tablet',
            drugs: {
                create: [
                    {
                        name: 'Paracetamol',
                        batch: {
                            create: [{
                                number: 'B123',
                                type: 'Tablet',
                                fullAmount: 100,
                                expiry: new Date('2025-12-01'),
                                remainingQuantity: 100,
                                price: 50,
                                status: 'AVAILABLE'
                            }]
                        }
                    },
                ],
            },
        },
    });

    //Add Prescription Data
    // const prescription = await prisma.prescription.create({
    //   data: {
    //     patientId: patient1.id,
    //     issues: {
    //       create: [
    //         {
    //           batchId: 1,
    //         },
    //       ],
    //     },
    //   },
    // });

    // Add Report Template & Reports
    const reportTemplate = await prisma.reportTemplate.create({
        data: {
            abbreviation: 'CBC',
            name: 'Complete Blood Count',
            parameters: {WBC: 'High', RBC: 'Normal'},
        },
    });

    await prisma.report.create({
        data: {
            templateId: reportTemplate.id,
            parameters: {result: 'Normal'},
            patientId: patient1.id,
        },
    });

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
