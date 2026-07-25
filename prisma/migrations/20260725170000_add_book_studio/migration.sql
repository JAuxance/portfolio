-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('WRITING', 'PAUSED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ChapterStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "language" "Locale" NOT NULL DEFAULT 'FR',
    "status" "BookStatus" NOT NULL DEFAULT 'WRITING',
    "targetWords" INTEGER NOT NULL DEFAULT 50000,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "status" "ChapterStatus" NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_slug_key" ON "Book"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_bookId_slug_key" ON "Chapter"("bookId", "slug");

-- CreateIndex
CREATE INDEX "Chapter_bookId_order_idx" ON "Chapter"("bookId", "order");

-- CreateIndex
CREATE INDEX "Chapter_bookId_status_idx" ON "Chapter"("bookId", "status");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
