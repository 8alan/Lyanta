/*
  Warnings:

  - The values [ериPROCESSING] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SELL', 'EXCHANGE', 'BOTH');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'MATCHED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WantRequestStatus" AS ENUM ('OPEN', 'MATCHED', 'COMPLETED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('PENDING', 'VERIFIED', 'PROCESSING', 'COMPLETED', 'FAILED', 'FLAGGED');
ALTER TABLE "public"."Transaction" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "public"."TransactionStatus_old";
ALTER TABLE "Transaction" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "giftCardId" TEXT NOT NULL,
    "askingPrice" DOUBLE PRECISION NOT NULL,
    "listingType" "ListingType" NOT NULL,
    "preferredBrand" TEXT,
    "maxExchangeValue" DOUBLE PRECISION,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "matchedRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WantRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "status" "WantRequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WantRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_giftCardId_key" ON "Listing"("giftCardId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_matchedRequestId_fkey" FOREIGN KEY ("matchedRequestId") REFERENCES "WantRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WantRequest" ADD CONSTRAINT "WantRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
