/*
  Warnings:

  - The values [LOCKED] on the enum `GiftCardStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [MATCHED] on the enum `ListingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `lockedAt` on the `GiftCard` table. All the data in the column will be lost.
  - You are about to drop the column `askingPrice` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `listingType` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `matchedRequestId` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `maxExchangeValue` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Payout` table. All the data in the column will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WantRequest` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BidType" AS ENUM ('CASH', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('CASH', 'EXCHANGE', 'CREDITS');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "GiftCardStatus_new" AS ENUM ('PENDING', 'VERIFIED', 'AVAILABLE', 'RESERVED', 'TRADED', 'CASHED_OUT', 'FLAGGED', 'FAILED');
ALTER TABLE "public"."GiftCard" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "GiftCard" ALTER COLUMN "status" TYPE "GiftCardStatus_new" USING ("status"::text::"GiftCardStatus_new");
ALTER TYPE "GiftCardStatus" RENAME TO "GiftCardStatus_old";
ALTER TYPE "GiftCardStatus_new" RENAME TO "GiftCardStatus";
DROP TYPE "public"."GiftCardStatus_old";
ALTER TABLE "GiftCard" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ListingStatus_new" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'RESERVED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Listing" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Listing" ALTER COLUMN "status" TYPE "ListingStatus_new" USING ("status"::text::"ListingStatus_new");
ALTER TYPE "ListingStatus" RENAME TO "ListingStatus_old";
ALTER TYPE "ListingStatus_new" RENAME TO "ListingStatus";
DROP TYPE "public"."ListingStatus_old";
ALTER TABLE "Listing" ALTER COLUMN "status" SET DEFAULT 'PENDING_VERIFICATION';
COMMIT;

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_matchedRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_giftCardId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "WantRequest" DROP CONSTRAINT "WantRequest_userId_fkey";

-- DropIndex
DROP INDEX "Payout_transactionId_key";

-- AlterTable
ALTER TABLE "GiftCard" DROP COLUMN "lockedAt";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "askingPrice",
DROP COLUMN "listingType",
DROP COLUMN "matchedRequestId",
DROP COLUMN "maxExchangeValue",
ADD COLUMN     "acceptsExchange" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "buyNowPrice" DOUBLE PRECISION,
ADD COLUMN     "minAcceptPrice" DOUBLE PRECISION,
ADD COLUMN     "preferredMinValue" DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'PENDING_VERIFICATION';

-- AlterTable
ALTER TABLE "Payout" DROP COLUMN "transactionId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT;

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "WantRequest";

-- DropEnum
DROP TYPE "ListingType";

-- DropEnum
DROP TYPE "OutputType";

-- DropEnum
DROP TYPE "TransactionStatus";

-- DropEnum
DROP TYPE "TransactionType";

-- DropEnum
DROP TYPE "WantRequestStatus";

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "bidType" "BidType" NOT NULL,
    "cashAmount" DOUBLE PRECISION,
    "offeredCardId" TEXT,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "bidId" TEXT,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "tradeType" "TradeType" NOT NULL,
    "finalPrice" DOUBLE PRECISION,
    "status" "TradeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_listingId_key" ON "Trade"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_bidId_key" ON "Trade"("bidId");

-- CreateIndex
CREATE UNIQUE INDEX "UserVerification_userId_key" ON "UserVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerification" ADD CONSTRAINT "UserVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
