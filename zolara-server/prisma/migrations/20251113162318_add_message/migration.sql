-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "forwarded_from" UUID;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_forwarded_from_fkey" FOREIGN KEY ("forwarded_from") REFERENCES "messages"("message_id") ON DELETE SET NULL ON UPDATE CASCADE;
