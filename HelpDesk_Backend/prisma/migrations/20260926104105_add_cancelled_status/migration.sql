-- AlterTable
ALTER TABLE `ticket_history` MODIFY `previousStatus` ENUM('Open', 'InProgress', 'Resolved', 'Cancelled') NULL,
    MODIFY `newStatus` ENUM('Open', 'InProgress', 'Resolved', 'Cancelled') NULL;

-- AlterTable
ALTER TABLE `tickets` MODIFY `status` ENUM('Open', 'InProgress', 'Resolved', 'Cancelled') NOT NULL DEFAULT 'Open';
