/*
  Warnings:

  - You are about to drop the column `user_id_1` on the `friends` table. All the data in the column will be lost.
  - You are about to drop the column `user_id_2` on the `friends` table. All the data in the column will be lost.
  - Added the required column `receiver_id` to the `friends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `friends` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QrCodeStatus" ADD VALUE 'FRIEND_REQUEST';
ALTER TYPE "QrCodeStatus" ADD VALUE 'FRIEND_CONFIRMED';

-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_user_id_1_fkey";

-- DropForeignKey
ALTER TABLE "friends" DROP CONSTRAINT "friends_user_id_2_fkey";

-- AlterTable
ALTER TABLE "friends" DROP COLUMN "user_id_1",
DROP COLUMN "user_id_2",
ADD COLUMN     "introduced_by" UUID,
ADD COLUMN     "receiver_id" UUID NOT NULL,
ADD COLUMN     "sender_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
