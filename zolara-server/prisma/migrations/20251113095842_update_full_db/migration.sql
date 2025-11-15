/*
  Warnings:

  - The values [OTHER] on the enum `DeviceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeviceType_new" AS ENUM ('MOBILE', 'TABLET', 'WEB', 'DESKTOP');
ALTER TABLE "refresh_tokens" ALTER COLUMN "device_type" TYPE "DeviceType_new" USING ("device_type"::text::"DeviceType_new");
ALTER TYPE "DeviceType" RENAME TO "DeviceType_old";
ALTER TYPE "DeviceType_new" RENAME TO "DeviceType";
DROP TYPE "DeviceType_old";
COMMIT;
