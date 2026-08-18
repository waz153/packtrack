-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LEADER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('LOCKED', 'UNLOCKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CheckinMethod" AS ENUM ('SELF', 'OVERRIDE');

-- CreateTable
CREATE TABLE "Scout" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "denId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Den" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,

    CONSTRAINT "Den_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passcode" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "unlockAt" TIMESTAMP(3),
    "lockAt" TIMESTAMP(3),
    "isManualOverride" BOOLEAN NOT NULL DEFAULT false,
    "qrToken" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'LOCKED',

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkin" (
    "id" TEXT NOT NULL,
    "scoutId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "CheckinMethod" NOT NULL,
    "checkedById" TEXT,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adventure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "denLevel" TEXT NOT NULL,

    CONSTRAINT "Adventure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdventureProgress" (
    "id" TEXT NOT NULL,
    "scoutId" TEXT NOT NULL,
    "adventureId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AdventureProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DenToPerson" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DenToPerson_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Scout_denId_idx" ON "Scout"("denId");

-- CreateIndex
CREATE UNIQUE INDEX "Den_name_key" ON "Den"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Event_qrToken_key" ON "Event"("qrToken");

-- CreateIndex
CREATE INDEX "Checkin_eventId_idx" ON "Checkin"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Checkin_scoutId_eventId_key" ON "Checkin"("scoutId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "AdventureProgress_scoutId_adventureId_key" ON "AdventureProgress"("scoutId", "adventureId");

-- CreateIndex
CREATE INDEX "_DenToPerson_B_index" ON "_DenToPerson"("B");

-- AddForeignKey
ALTER TABLE "Scout" ADD CONSTRAINT "Scout_denId_fkey" FOREIGN KEY ("denId") REFERENCES "Den"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_scoutId_fkey" FOREIGN KEY ("scoutId") REFERENCES "Scout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdventureProgress" ADD CONSTRAINT "AdventureProgress_scoutId_fkey" FOREIGN KEY ("scoutId") REFERENCES "Scout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdventureProgress" ADD CONSTRAINT "AdventureProgress_adventureId_fkey" FOREIGN KEY ("adventureId") REFERENCES "Adventure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DenToPerson" ADD CONSTRAINT "_DenToPerson_A_fkey" FOREIGN KEY ("A") REFERENCES "Den"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DenToPerson" ADD CONSTRAINT "_DenToPerson_B_fkey" FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
