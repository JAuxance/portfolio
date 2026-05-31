-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('BUILDING', 'SHIPPED', 'LEARNING', 'STUDYING', 'ESSAY');

-- CreateEnum
CREATE TYPE "StationState" AS ENUM ('CURRENT', 'PLANNED', 'GOAL');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('EN', 'FR');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Auxance Jourdan',
    "handle" TEXT NOT NULL DEFAULT 'Auxance',
    "emailPublic" TEXT NOT NULL DEFAULT 'jauxance@gmail.com',
    "github" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "readcv" TEXT,
    "abstractEn" TEXT NOT NULL,
    "abstractFr" TEXT NOT NULL,
    "contactBlurbEn" TEXT NOT NULL,
    "contactBlurbFr" TEXT NOT NULL,
    "defaultLocale" "Locale" NOT NULL DEFAULT 'EN',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NowItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "bodyFr" TEXT NOT NULL,
    "stack" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NowItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "taglineEn" TEXT NOT NULL,
    "taglineFr" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL,
    "stack" TEXT[],
    "liveUrl" TEXT,
    "repoUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "contextEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contextFr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "architecture" JSONB,
    "decisions" JSONB,
    "lessons" JSONB,
    "heroImage" TEXT,
    "timelineEn" TEXT,
    "timelineFr" TEXT,
    "roleEn" TEXT,
    "roleFr" TEXT,
    "teamEn" TEXT,
    "teamFr" TEXT,
    "contextLabelEn" TEXT,
    "contextLabelFr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchTopic" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "bodyFr" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrajectoryStation" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "instEn" TEXT NOT NULL,
    "instFr" TEXT NOT NULL,
    "objEn" TEXT NOT NULL,
    "objFr" TEXT NOT NULL,
    "state" "StationState" NOT NULL,
    "order" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrajectoryStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
