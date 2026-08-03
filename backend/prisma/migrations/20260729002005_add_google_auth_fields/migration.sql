/*
  Warnings:

  - You are about to drop the column `address` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `occupation` on the `Member` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phone` on table `Member` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `Member` required. This step will fail if there are existing NULL values in that column.
  - Made the column `latitude` on table `Member` required. This step will fail if there are existing NULL values in that column.
  - Made the column `longitude` on table `Member` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Visit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Local" ADD COLUMN     "districtId" TEXT;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "address",
DROP COLUMN "occupation",
ADD COLUMN     "accuracy" DOUBLE PRECISION,
ADD COLUMN     "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'DATA_OFFICER';

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "visitDate" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Member_localId_idx" ON "Member"("localId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "Visit_memberId_idx" ON "Visit"("memberId");

-- CreateIndex
CREATE INDEX "Visit_pastorId_idx" ON "Visit"("pastorId");

-- AddForeignKey
ALTER TABLE "Local" ADD CONSTRAINT "Local_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
