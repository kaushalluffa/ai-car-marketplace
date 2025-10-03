-- CreateTable
CREATE TABLE "public"."CarMakes" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarMakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarBodyTypes" (
    "id" TEXT NOT NULL,
    "bodyType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarBodyTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarFuelTypes" (
    "id" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarFuelTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CarTransmissions" (
    "id" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarTransmissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarMakes_make_key" ON "public"."CarMakes"("make");

-- CreateIndex
CREATE UNIQUE INDEX "CarBodyTypes_bodyType_key" ON "public"."CarBodyTypes"("bodyType");

-- CreateIndex
CREATE UNIQUE INDEX "CarFuelTypes_fuelType_key" ON "public"."CarFuelTypes"("fuelType");

-- CreateIndex
CREATE UNIQUE INDEX "CarTransmissions_transmission_key" ON "public"."CarTransmissions"("transmission");
