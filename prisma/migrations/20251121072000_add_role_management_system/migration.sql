-- CreateTable: roles
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `permissions` JSON NOT NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    UNIQUE INDEX `roles_slug_key`(`slug`),
    INDEX `roles_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default system roles
INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `permissions`, `isSystem`, `createdAt`, `updatedAt`) VALUES
('role_super_admin', 'Super Admin', 'super_admin', 'Full system access with all permissions', '["users.view","users.create","users.edit","users.delete","users.manage_roles","roles.view","roles.create","roles.edit","roles.delete","roles.assign","content.view","content.create","content.edit","content.delete","media.view","media.upload","media.delete","apiKeys.view","apiKeys.create","apiKeys.delete","settings.view","settings.edit"]', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
('role_admin', 'Admin', 'admin', 'Administrative access with limited permissions', '["users.view","users.create","users.edit","content.view","content.create","content.edit","content.delete","media.view","media.upload","media.delete","apiKeys.view","apiKeys.create","settings.view"]', true, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

-- Add roleId column to users table (nullable first)
ALTER TABLE `users` ADD COLUMN `roleId` VARCHAR(191) NULL;

-- Migrate existing users from enum to role FK
UPDATE `users` SET `roleId` = 'role_super_admin' WHERE `role` = 'SUPER_ADMIN';
UPDATE `users` SET `roleId` = 'role_admin' WHERE `role` = 'ADMIN';

-- Make roleId NOT NULL after migration
ALTER TABLE `users` MODIFY `roleId` VARCHAR(191) NOT NULL;

-- Drop old role enum column
ALTER TABLE `users` DROP COLUMN `role`;

-- Add foreign key constraint
ALTER TABLE `users` ADD CONSTRAINT `users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add index on roleId
CREATE INDEX `users_roleId_idx` ON `users`(`roleId`);
