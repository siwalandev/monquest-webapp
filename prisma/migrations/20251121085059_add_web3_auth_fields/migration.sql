/*
  Warnings:

  - A unique constraint covering the columns `[walletAddress]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[privyId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `roles` MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `authMethod` ENUM('EMAIL', 'WEB3', 'HYBRID') NOT NULL DEFAULT 'EMAIL',
    ADD COLUMN `privyId` VARCHAR(191) NULL,
    ADD COLUMN `walletAddress` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_walletAddress_key` ON `users`(`walletAddress`);

-- CreateIndex
CREATE UNIQUE INDEX `users_privyId_key` ON `users`(`privyId`);

-- CreateIndex
CREATE INDEX `users_walletAddress_idx` ON `users`(`walletAddress`);

-- CreateIndex
CREATE INDEX `users_privyId_idx` ON `users`(`privyId`);
