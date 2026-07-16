-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeTransferId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeAccountId" TEXT;
