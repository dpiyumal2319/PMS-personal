-- CreateTable
CREATE TABLE `Patient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telephone` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NULL,
    `address` VARCHAR(191) NULL,
    `height` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `NIC` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('DOCTOR', 'NURSE') NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Queue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start` DATETIME(3) NOT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED') NOT NULL,
    `end` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QueueEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `queueId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED') NOT NULL,
    `patientId` INTEGER NULL,
    `time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DrugBrand` (
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Drug` (
    `name` VARCHAR(191) NOT NULL,
    `brandName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Batch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` VARCHAR(191) NOT NULL,
    `drugName` VARCHAR(191) NOT NULL,
    `type` ENUM('Tablet', 'Syrup') NOT NULL,
    `fullAmount` DOUBLE NOT NULL,
    `expiry` DATETIME(3) NOT NULL,
    `stockDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `remainingQuantity` DOUBLE NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` ENUM('AVAILABLE', 'EXPIRED', 'COMPLETED', 'TRASHED') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prescription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Issue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prescriptionId` INTEGER NOT NULL,
    `batchId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `abbreviation` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `parameters` JSON NOT NULL,

    UNIQUE INDEX `ReportTemplate_abbreviation_key`(`abbreviation`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `templateId` INTEGER NOT NULL,
    `parameters` JSON NOT NULL,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `patientId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QueueEntry` ADD CONSTRAINT `QueueEntry_queueId_fkey` FOREIGN KEY (`queueId`) REFERENCES `Queue`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QueueEntry` ADD CONSTRAINT `QueueEntry_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Drug` ADD CONSTRAINT `Drug_brandName_fkey` FOREIGN KEY (`brandName`) REFERENCES `DrugBrand`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Batch` ADD CONSTRAINT `Batch_drugName_fkey` FOREIGN KEY (`drugName`) REFERENCES `Drug`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Issue` ADD CONSTRAINT `Issue_prescriptionId_fkey` FOREIGN KEY (`prescriptionId`) REFERENCES `Prescription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Issue` ADD CONSTRAINT `Issue_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `Batch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `ReportTemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
