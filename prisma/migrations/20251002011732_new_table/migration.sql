/*
  Warnings:

  - You are about to drop the column `bodyType` on the `CarBodyTypes` table. All the data in the column will be lost.
  - You are about to drop the column `fuelType` on the `CarFuelTypes` table. All the data in the column will be lost.
  - You are about to drop the column `make` on the `CarMakes` table. All the data in the column will be lost.
  - You are about to drop the column `transmission` on the `CarTransmissions` table. All the data in the column will be lost.
  - Added the required column `name` to the `CarBodyTypes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CarFuelTypes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CarMakes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CarTransmissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."CarBodyTypes_bodyType_key";

-- DropIndex
DROP INDEX "public"."CarFuelTypes_fuelType_key";

-- DropIndex
DROP INDEX "public"."CarMakes_make_key";

-- DropIndex
DROP INDEX "public"."CarTransmissions_transmission_key";

-- AlterTable
ALTER TABLE "public"."CarBodyTypes" DROP COLUMN "bodyType",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CarFuelTypes" DROP COLUMN "fuelType",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CarMakes" DROP COLUMN "make",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."CarTransmissions" DROP COLUMN "transmission",
ADD COLUMN     "name" TEXT NOT NULL;
