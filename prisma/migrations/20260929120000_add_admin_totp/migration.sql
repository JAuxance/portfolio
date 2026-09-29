-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "totpSecret" TEXT,
ADD COLUMN     "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpLastStep" INTEGER;
