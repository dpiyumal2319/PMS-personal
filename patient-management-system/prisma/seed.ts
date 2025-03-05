import {PrismaClient, DrugType, BatchStatus, Gender, Role} from '@prisma/client'
import {faker} from '@faker-js/faker'

const prisma = new PrismaClient()

// Common drug names (generic names)
const drugNames = [
    'Paracetamol',
    'Ibuprofen',
    'Amoxicillin',
    'Omeprazole',
    'Metformin',
    'Amlodipine',
    'Cetirizine',
    'Azithromycin',
    'Metronidazole',
    'Gabapentin'
]

// Common concentrations in mg
const tabletConcentrations = [100, 200, 250, 325, 400, 500, 600, 650, 750, 1000]
const syrupConcentrations = [100, 125, 150, 200, 250] // mg/5ml typically

async function createUnitConcentrations() {
    console.log('\n--- Creating Unit Concentrations ---')
    const allConcentrations = [...new Set([...tabletConcentrations, ...syrupConcentrations])]

    for (const concentration of allConcentrations) {
        await prisma.unitConcentration.create({
            data: {concentration}
        })
        console.log(`Created concentration: ${concentration}mg`)
    }
}

async function createSuppliers() {
    console.log('\n--- Creating Suppliers ---');
    const suppliers = [];

    for (let i = 0; i < 10; i++) {
        const supplier = await prisma.supplier.create({
            data: {
                name: faker.company.name(),
                contact: faker.phone.number(),
          
            }
        });
        console.log(`Created supplier: ${supplier.name}`);
        suppliers.push(supplier);
    }
    return suppliers;
}

async function createUsersAndPatients() {
    console.log('\n--- Creating Users and Patients ---')

    // Generate 50 random patients
    const patients = Array.from({length: 50}).map(() => ({
        telephone: faker.phone.number({style: 'national'}),
        name: faker.person.fullName(),
        birthDate: faker.date.birthdate({min: 18, max: 80, mode: 'age'}),
        address: `${faker.location.city()}, Sri Lanka`,
        height: faker.number.int({min: 150, max: 190}),
        weight: faker.number.int({min: 50, max: 100}),
        gender: faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]),
        NIC: `${faker.number.int({min: 190000000, max: 209999999})}V`,
    }))

    // Insert the random patients into the database
    await prisma.patient.createMany({data: patients})
    console.log(`Created ${patients.length} patients`)

    // Create staff users
    const staffUsers = [
        {
            email: 'doctor1@srilanka.com',
            mobile: '0765432189',
            password: '$2a$10$uQpRRBUzSZWg6vqcVHE3HeDiuN5aJcvM5dXaU.IBnFNYuaxniCE.a',
            role: Role.DOCTOR,
            gender: Gender.MALE,
            name: 'Dasun Piyumal'
        },
        {
            email: 'nurse1@srilanka.com',
            mobile: '0775671234',
            password: '$2a$10$uQpRRBUzSZWg6vqcVHE3HeDiuN5aJcvM5dXaU.IBnFNYuaxniCE.a',
            role: Role.NURSE,
            gender: Gender.FEMALE,
            name: 'Kasuni Nimali'
        },
        {
            email: 'nurse2@srilanka.com',
            mobile: '0775677890',
            password: '$2a$10$uQpRRBUzSZWg6vqcVHE3HeDiuN5aJcvM5dXaU.IBnFNYuaxniCE.a',
            role: Role.NURSE,
            gender: Gender.FEMALE,
            name: 'Dilini Perera'
        }
    ]

    for (const user of staffUsers) {
        await prisma.user.create({data: user})
        console.log(`Created ${user.role.toLowerCase()}: ${user.name}`)
    }
}

async function generateBatchData(drugType: DrugType, createdAt: Date, supplierId: number) {
    const expiryDate = new Date(createdAt)
    expiryDate.setDate(expiryDate.getDate() + faker.number.int({min: 1, max: 730})) // 1 day to 2 years

    const concentrations = drugType === DrugType.Tablet ? tabletConcentrations : syrupConcentrations
    const concentration = concentrations[Math.floor(Math.random() * concentrations.length)]

    const fullAmount = faker.number.int({min: 50, max: 1000})
    const wholesalePrice = faker.number.float({min: 10, max: 100, fractionDigits: 2})

    // Get the concentration ID instead of the value
    const unitConcentration = await prisma.unitConcentration.findFirst({
        where: {concentration}
    })

    if (!unitConcentration) {
        throw new Error(`Concentration ${concentration} not found in database`)
    }

    return {
        number: faker.string.alphanumeric(8).toUpperCase(),
        type: drugType,
        fullAmount,
        remainingQuantity: fullAmount,
        expiry: expiryDate,
        wholesalePrice,
        retailPrice: wholesalePrice * 1.3, // 30% markup
        status: BatchStatus.AVAILABLE,
        unitConcentrationId: unitConcentration.id ,// Pass the ID instead of concentration value
        supplierId
    }
}

// Add this function to create a pool of pharmaceutical brands
async function createDrugBrands(count: number) {
    console.log('\n--- Creating Drug Brands ---')
    const brands = []

    for (let i = 0; i < count; i++) {
        const brand = await prisma.drugBrand.create({
            data: {
                name: faker.company.name() + ' Pharmaceuticals',
                description: faker.company.catchPhrase()
            }
        })
        console.log(`Created brand: ${brand.name}`)
        brands.push(brand)
    }

    return brands
}

async function createDrugsAndBatches() {
    console.log('\n--- Creating Drugs and Batches ---')

    // Create a pool of brands first (20 pharmaceutical companies)
    const allSuppliers = await createSuppliers(); // Get suppliers
    const allBrands = await createDrugBrands(20)

    // Create drugs and their batches
    for (const drugName of drugNames) {
        console.log(`\nProcessing drug: ${drugName}`)

        // Create drug
        const drug = await prisma.drug.create({
            data: {name: drugName,
                Buffer: faker.number.int({ min: 10, max: 100 }) // Random buffer value
            }
        })
         console.log(`Created drug: ${drug.name} (ID: ${drug.id}, Buffer: ${drug.Buffer})`)

        // Randomly select 2-4 brands that will manufacture this drug
        const brandCount = faker.number.int({min: 2, max: 4})
        const selectedBrands = faker.helpers.shuffle([...allBrands]).slice(0, brandCount)

        for (const brand of selectedBrands) {
            console.log(`Assigning ${brand.name} to produce ${drugName}`)

            // Create 3-10 batches for each brand-drug combination
            const batchCount = faker.number.int({min: 2, max: 5})
            const syrupCount = faker.number.int({min: 0, max: 1}) // 0-2 syrups

            for (let i = 0; i < batchCount; i++) {
                const drugType = i < syrupCount ? DrugType.Syrup : DrugType.Tablet
                const supplier = faker.helpers.arrayElement(allSuppliers); // Random supplier
                const batchData = await generateBatchData(drugType, new Date(),supplier.id)

                const batch = await prisma.batch.create({
                    data: {
                        ...batchData,
                        drugId: drug.id,
                        drugBrandId: brand.id
                    }
                })

                console.log(`Created batch: ${batch.number} (${batch.type}, Brand: ${brand.name})`)
            }
        }
    }
}

async function createReportTypes() {
    console.log('\n--- Creating Report Types and Parameters ---')

    const reportTypes = [
        {
            name: 'Full Blood Count (FBC)',
            description: 'Complete blood cell count analysis',
            parameters: [
                {name: 'WBC', units: '×10^9/L'},
                {name: 'RBC', units: '×10^12/L'},
                {name: 'Hemoglobin', units: 'g/dL'},
                {name: 'Platelets', units: '×10^9/L'},
                {name: 'Hematocrit', units: '%'}
            ]
        },
        {
            name: 'Liver Function Test (LFT)',
            description: 'Assessment of liver function and health',
            parameters: [
                {name: 'ALT', units: 'U/L'},
                {name: 'AST', units: 'U/L'},
                {name: 'Bilirubin', units: 'mg/dL'},
                {name: 'Albumin', units: 'g/dL'}
            ]
        },
        {
            name: 'Lipid Profile',
            description: 'Cholesterol and triglycerides measurement',
            parameters: [
                {name: 'Total Cholesterol', units: 'mg/dL'},
                {name: 'HDL', units: 'mg/dL'},
                {name: 'LDL', units: 'mg/dL'},
                {name: 'Triglycerides', units: 'mg/dL'}
            ]
        },
        {
            name: 'Kidney Function Test',
            description: 'Assessment of kidney function',
            parameters: [
                {name: 'Creatinine', units: 'mg/dL'},
                {name: 'BUN', units: 'mg/dL'},
                {name: 'eGFR', units: 'mL/min/1.73m²'}
            ]
        },
        {
            name: 'Thyroid Function Test',
            description: 'Evaluation of thyroid hormone levels',
            parameters: [
                {name: 'TSH', units: 'mIU/L'},
                {name: 'T3', units: 'ng/dL'},
                {name: 'T4', units: 'µg/dL'}
            ]
        },
        {
            name: 'Blood Glucose Test',
            description: 'Blood sugar level measurement',
            parameters: [
                {name: 'Fasting Blood Sugar', units: 'mg/dL'},
                {name: 'Post Prandial Blood Sugar', units: 'mg/dL'},
                {name: 'HbA1c', units: '%'}
            ]
        },
        {
            name: 'Electrolyte Panel',
            description: 'Measurement of blood electrolyte levels',
            parameters: [
                {name: 'Sodium', units: 'mEq/L'},
                {name: 'Potassium', units: 'mEq/L'},
                {name: 'Chloride', units: 'mEq/L'},
                {name: 'Bicarbonate', units: 'mEq/L'}
            ]
        },
        {
            name: 'CRP Test',
            description: 'C-Reactive Protein inflammation marker test',
            parameters: [
                {name: 'CRP Level', units: 'mg/L'},
                {name: 'ESR', units: 'mm/hr'},
                {name: 'PCT', units: 'ng/mL'}
            ]
        },
        {
            name: 'Urinalysis',
            description: 'Physical and chemical examination of urine',
            parameters: [
                {name: 'pH', units: null},
                {name: 'Specific Gravity', units: null},
                {name: 'Protein', units: 'mg/dL'},
                {name: 'Glucose', units: 'mg/dL'}
            ]
        },
        {
            name: 'Cardiac Markers',
            description: 'Heart function and damage indicators',
            parameters: [
                {name: 'Troponin I', units: 'ng/mL'},
                {name: 'CK-MB', units: 'ng/mL'},
                {name: 'BNP', units: 'pg/mL'}
            ]
        }
    ]

    for (const reportType of reportTypes) {
        const created = await prisma.reportType.create({
            data: {
                name: reportType.name,
                description: reportType.description,
                parameters: {
                    create: reportType.parameters
                }
            }
        })
        console.log(`Created report type: ${created.name} with ${reportType.parameters.length} parameters`)
    }
}


async function main() {
    console.log('\nStarting database seeding...')

    // Create all data in sequence
    await createUnitConcentrations()
    await createUsersAndPatients()
    await createDrugsAndBatches()
    await createReportTypes()

    console.log('\nDatabase seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })